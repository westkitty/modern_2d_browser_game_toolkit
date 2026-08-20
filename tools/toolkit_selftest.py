#!/usr/bin/env python3
from __future__ import annotations

import json
import py_compile
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / 'tools'
EXAMPLES = ROOT / 'examples'
sys.path.insert(0, str(TOOLS))

from architecture_linter import lint
from architecture_preflight import build_report
from bootstrap_project import bootstrap_project
from checklist_generator import activated_keys
from common import load_json, validate_project_contract
from manifest_validator import validate as validate_manifest


def fail(msg: str) -> None:
    raise RuntimeError(msg)


def main() -> int:
    # Syntax: compile every Python tool in process so the self-test is reliable even
    # in instrumented environments where nested Python subprocess shutdown can hang.
    for p in sorted(TOOLS.glob('*.py')):
        py_compile.compile(str(p), doraise=True)
    if shutil.which('node'):
        r = subprocess.run(['node', '--check', str(TOOLS/'browser_smoke.mjs')], text=True, capture_output=True, timeout=10)
        if r.returncode:
            fail(r.stderr or 'browser_smoke.mjs syntax check failed')

    with tempfile.TemporaryDirectory() as td:
        project = Path(td)/'sample'
        cfg_path = bootstrap_project(project, 'Toolkit Selftest', ROOT/'templates')
        cfg = load_json(cfg_path)
        if validate_project_contract(cfg): fail('bootstrap contract did not validate')
        if '# Architecture Activation Report' not in build_report(cfg, project): fail('preflight did not build report')
        if lint(project, cfg): fail('clean bootstrap project unexpectedly linted')
        manifest = project/'assets'/'manifest.json'; manifest.parent.mkdir(); manifest.write_text('{"schemaVersion":1,"atlases":{},"assets":{}}')
        if validate_manifest(load_json(manifest), manifest, project, False, False): fail('clean manifest unexpectedly failed')

    # Negative linter fixture: the tool must catch a fake secret and desktop OpenGL name.
    with tempfile.TemporaryDirectory() as td:
        project=Path(td); (project/'src').mkdir();
        cfg=load_json(ROOT/'templates'/'architecture.project.json'); cfg['projectName']='Violation Fixture'
        (project/'architecture.project.json').write_text(json.dumps(cfg,indent=2)+'\n')
        (project/'src'/'bad.js').write_text("const key='sk-proj-abcdefghijklmnopqrstuv';\nfunction f(){ glDrawElements(1); }\n")
        codes={f['code'] for f in lint(project,cfg)}
        if not {'SEC003','WEBGL101'} <= codes: fail(f'negative linter fixture missed rules: {codes}')

    # Negative manifest fixture: frame bounds must be enforced.
    with tempfile.TemporaryDirectory() as td:
        project=Path(td); (project/'assets').mkdir(); manifest=project/'assets'/'manifest.json'
        data={'schemaVersion':1,'atlases':{'main':{'image':'atlas.png','width':32,'height':32}},'assets':{'bad':{'kind':'atlasFrame','atlas':'main','frame':{'x':20,'y':0,'w':20,'h':20}}}}
        manifest.write_text(json.dumps(data)); codes={f['code'] for f in validate_manifest(data,manifest,project,False,False)}
        if 'MAN024' not in codes: fail('negative manifest fixture missed MAN024')

    example_dirs=sorted(p for p in EXAMPLES.iterdir() if p.is_dir())
    if len(example_dirs)!=10: fail(f'expected exactly 10 examples, found {len(example_dirs)}')
    for example in example_dirs:
        cfg=load_json(example/'architecture.project.json'); errs=validate_project_contract(cfg)
        if errs: fail(f'{example.name}: invalid contract: {errs}')
        _=build_report(cfg,example); _=activated_keys(cfg)
        findings=lint(example,cfg); errors=[f for f in findings if f['severity']=='error']
        if errors: fail(f'{example.name}: linter errors: {errors}')
        if cfg['capabilities']['generatedAssets']:
            manifest=example/cfg['capabilities']['assetManifest']; mf=validate_manifest(load_json(manifest),manifest,example,False,False)
            if any(f['severity']=='error' for f in mf): fail(f'{example.name}: manifest errors: {mf}')
        print(f'PASS example {example.name}')

    print('PASS toolkit self-test')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
