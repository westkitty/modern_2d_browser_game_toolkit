#!/usr/bin/env python3
from __future__ import annotations

import argparse
import fnmatch
import json
import re
from pathlib import Path
from common import load_json, validate_project_contract, relative_to_any

TEXT_EXTS = {'.js','.mjs','.cjs','.ts','.tsx','.jsx','.html','.css','.json','.md'}
SECRET_PATTERNS = [
    ('SEC001', re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'), 'private key material'),
    ('SEC002', re.compile(r'\bAKIA[0-9A-Z]{16}\b'), 'AWS access key-like literal'),
    ('SEC003', re.compile(r'\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b'), 'API key-like literal'),
    ('SEC004', re.compile(r'\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b'), 'JWT-like literal'),
]
DESKTOP_GL = re.compile(r'\bgl(?:DrawElementsInstancedWithBaseVertex|DrawElements|DrawArrays|BindVertexArray|GenBuffers)\b')
TOKEN_URL = re.compile(r'https?://[^\s\'\"]+[?&](?:token|access_token|jwt|api_key|key)=', re.I)
ASSET_LITERAL = re.compile(r'[\'\"]([^\'\"]*(?:assets?|sprites?|textures?|audio)/[^\'\"]+)[\'\"]', re.I)


def ignored(path: Path, root: Path, patterns: list[str]) -> bool:
    rel = path.relative_to(root).as_posix()
    parts = set(path.relative_to(root).parts)
    for pat in patterns:
        if pat in parts or fnmatch.fnmatch(rel, pat) or fnmatch.fnmatch(path.name, pat):
            return True
    return False


def scan_files(root: Path, cfg: dict):
    ignore = [*cfg['paths']['ignore'], *cfg.get('lint', {}).get('ignorePaths', [])]
    for p in root.rglob('*'):
        if not p.is_file() or p.suffix.lower() not in TEXT_EXTS:
            continue
        if ignored(p, root, ignore):
            continue
        try:
            yield p, p.read_text(encoding='utf-8', errors='replace')
        except OSError:
            continue


def line_of(text: str, index: int) -> int:
    return text.count('\n', 0, index) + 1


def lint(root: Path, cfg: dict):
    findings = []
    def add(sev, code, msg, path=None, line=None):
        findings.append({"severity": sev, "code": code, "message": msg,
                         "path": str(path.relative_to(root)) if path else None, "line": line})

    caps = cfg['capabilities']
    manifest_rel = caps.get('assetManifest')
    if caps['generatedAssets']:
        if not manifest_rel:
            add('error','CFG101','generatedAssets=true requires capabilities.assetManifest')
        elif not (root / manifest_rel).is_file():
            add('error','ASSET101',f'declared asset manifest does not exist: {manifest_rel}')

    if caps['sharedArrayBuffer']:
        headers = cfg.get('deploymentHeaders', {})
        if headers.get('Cross-Origin-Opener-Policy') != 'same-origin':
            add('error','SEC101','SharedArrayBuffer contract requires COOP same-origin')
        if headers.get('Cross-Origin-Embedder-Policy') not in {'require-corp','credentialless'}:
            add('error','SEC102','SharedArrayBuffer contract requires COEP require-corp or credentialless')

    if cfg['timingModel'] in {'fixed','fixed_interpolated'} and not cfg['validation']['commands']:
        add('warning','TIME101','fixed timing selected but no validation commands are declared')
    if caps['deploymentAutomation'] and not cfg['validation']['commands']:
        add('warning','DEP101','deployment automation selected but no validation commands are declared')

    allowed_asset = [(root / p).resolve() for p in cfg['paths']['allowedAssetLiteralFiles']]
    frontend_roots = [(root / p).resolve() for p in cfg['paths']['frontend'] if (root / p).exists()]
    frontend_text = []
    for p, text in scan_files(root, cfg):
        is_frontend = relative_to_any(p.resolve(), frontend_roots) if frontend_roots else False
        if is_frontend:
            frontend_text.append(text)
        for code, regex, desc in SECRET_PATTERNS:
            for m in regex.finditer(text):
                add('error',code,desc,p,line_of(text,m.start()))
        for m in TOKEN_URL.finditer(text):
            add('error','SEC005','credential-like value embedded in URL/query string',p,line_of(text,m.start()))
        for m in DESKTOP_GL.finditer(text):
            add('error','WEBGL101',f'desktop OpenGL-style API name in browser source: {m.group(0)}',p,line_of(text,m.start()))
        if is_frontend and caps['generatedAssets'] and not relative_to_any(p.resolve(), allowed_asset):
            for m in ASSET_LITERAL.finditer(text):
                add('warning','ASSET102',f'direct asset path literal outside allowed loader/catalog file: {m.group(1)}',p,line_of(text,m.start()))
        adds = len(re.findall(r'\.addEventListener\s*\(', text)) if is_frontend else 0
        removes = len(re.findall(r'\.removeEventListener\s*\(', text)) if is_frontend else 0
        if is_frontend and adds >= 3 and removes == 0:
            add('warning','LIFE101',f'{adds} addEventListener calls and no removeEventListener in this file; verify lifecycle ownership',p,None)
        rafs = len(re.findall(r'\brequestAnimationFrame\s*\(', text)) if is_frontend else 0
        if is_frontend and rafs >= 3:
            add('info','TIME102',f'{rafs} requestAnimationFrame calls in one file; verify there is not more than one unintended loop owner',p,None)

    joined = '\n'.join(frontend_text)
    if caps['webAudio'] and 'AudioContext' not in joined:
        add('warning','AUDIO101','webAudio=true but no AudioContext reference was found in scanned frontend paths')
    if 'AudioContext' in joined and '.resume(' not in joined:
        add('warning','AUDIO102','AudioContext referenced but no resume() call found; verify user-activation lifecycle')
    if 'SharedArrayBuffer' in joined and not caps['sharedArrayBuffer']:
        add('warning','SEC103','SharedArrayBuffer appears in source but is not activated in architecture contract')
    ignored_codes = set(cfg.get('lint', {}).get('ignoreCodes', []))
    return [f for f in findings if f['code'] not in ignored_codes]


def main() -> int:
    ap = argparse.ArgumentParser(description='Contract-driven static linter for 2D browser-game repositories.')
    ap.add_argument('project_root', type=Path)
    ap.add_argument('--config', type=Path, default=Path('architecture.project.json'))
    ap.add_argument('--json', type=Path)
    ap.add_argument('--strict', action='store_true', help='treat warnings as failing')
    args = ap.parse_args()
    root = args.project_root.resolve()
    config_path = args.config if args.config.is_absolute() else root / args.config
    try:
        cfg = load_json(config_path)
    except Exception as e:
        print(f'ERROR CFG000: cannot load config: {e}')
        return 1
    config_errors = validate_project_contract(cfg)
    if config_errors:
        for e in config_errors:
            print(f'ERROR CFG001: {e}')
        return 1
    findings = lint(root, cfg)
    rank = {'error':0,'warning':1,'info':2}
    findings.sort(key=lambda f:(rank[f['severity']], f.get('path') or '', f.get('line') or 0, f['code']))
    for f in findings:
        where = ''
        if f['path']:
            where = f" {f['path']}" + (f":{f['line']}" if f['line'] else '')
        print(f"{f['severity'].upper()} {f['code']}{where}: {f['message']}")
    errors = sum(f['severity']=='error' for f in findings)
    warnings = sum(f['severity']=='warning' for f in findings)
    infos = sum(f['severity']=='info' for f in findings)
    print(f'SUMMARY errors={errors} warnings={warnings} info={infos}')
    if args.json:
        args.json.write_text(json.dumps({"findings":findings,"summary":{"errors":errors,"warnings":warnings,"info":infos}}, indent=2), encoding='utf-8')
    return 1 if errors or (args.strict and warnings) else 0

if __name__ == '__main__':
    raise SystemExit(main())
