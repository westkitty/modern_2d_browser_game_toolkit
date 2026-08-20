#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shlex
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / 'tools'


def run(cmd: list[str], *, cwd: Path, allow_codes: set[int] = {0}) -> tuple[int, str, str]:
    r = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    if r.stdout:
        print(r.stdout.rstrip())
    if r.stderr:
        print(r.stderr.rstrip(), file=sys.stderr)
    if r.returncode not in allow_codes:
        return r.returncode, r.stdout, r.stderr
    return r.returncode, r.stdout, r.stderr


def main() -> int:
    ap = argparse.ArgumentParser(description='Run the architecture toolkit checks for one browser-game project.')
    ap.add_argument('project_root', type=Path)
    ap.add_argument('--config', type=Path, default=Path('architecture.project.json'))
    ap.add_argument('--out-dir', type=Path, default=Path('.architecture-checks'))
    ap.add_argument('--strict-lint', action='store_true')
    ap.add_argument('--execute-project-commands', action='store_true', help='run validation.commands from the contract')
    ap.add_argument('--browser', action='store_true', help='run optional Playwright smoke if browserUrl is declared')
    ap.add_argument('--verify-asset-files', action='store_true')
    ap.add_argument('--verify-asset-hashes', action='store_true')
    args = ap.parse_args()

    project = args.project_root.resolve()
    config = args.config if args.config.is_absolute() else project / args.config
    out_dir = args.out_dir if args.out_dir.is_absolute() else project / args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    try:
        cfg = json.loads(config.read_text(encoding='utf-8'))
    except Exception as e:
        print(f'FAIL: cannot load {config}: {e}', file=sys.stderr)
        return 1

    results: list[dict] = []

    def stage(name: str, cmd: list[str], allow_codes: set[int] = {0}):
        print(f'\n== {name} ==')
        print('$ ' + ' '.join(shlex.quote(x) for x in cmd))
        code, stdout, stderr = run(cmd, cwd=project, allow_codes=allow_codes)
        results.append({'name': name, 'command': cmd, 'returnCode': code, 'stdout': stdout, 'stderr': stderr})
        return code

    failures = 0
    if stage('Architecture activation', [sys.executable, str(TOOLS/'architecture_preflight.py'), str(config), '--project-root', str(project), '--out', str(out_dir/'ACTIVATION.md')]) != 0:
        failures += 1
    if stage('Validation checklist', [sys.executable, str(TOOLS/'checklist_generator.py'), str(config), '--out', str(out_dir/'VALIDATION_CHECKLIST.md')]) != 0:
        failures += 1

    lint_cmd = [sys.executable, str(TOOLS/'architecture_linter.py'), str(project), '--config', str(config), '--json', str(out_dir/'architecture-lint.json')]
    if args.strict_lint:
        lint_cmd.append('--strict')
    if stage('Architecture linter', lint_cmd) != 0:
        failures += 1

    caps = cfg.get('capabilities', {})
    if caps.get('generatedAssets') and caps.get('assetManifest'):
        manifest = project / caps['assetManifest']
        man_cmd = [sys.executable, str(TOOLS/'manifest_validator.py'), str(manifest), '--project-root', str(project), '--json', str(out_dir/'manifest-validation.json')]
        if args.verify_asset_files:
            man_cmd.append('--verify-files')
        if args.verify_asset_hashes:
            man_cmd.extend(['--verify-files', '--verify-hashes'])
        if stage('Asset manifest', man_cmd) != 0:
            failures += 1

    if args.execute_project_commands:
        for i, command in enumerate(cfg.get('validation', {}).get('commands', []), start=1):
            # Validation commands are explicit project-authorized strings from the contract.
            if stage(f'Project validation command {i}', ['bash', '-lc', command]) != 0:
                failures += 1

    if args.browser:
        url = cfg.get('validation', {}).get('browserUrl')
        if not url:
            results.append({'name': 'Browser smoke', 'returnCode': 2, 'status': 'skipped', 'reason': 'browserUrl not declared'})
            print('\n== Browser smoke ==\nSKIP: validation.browserUrl is not declared')
        else:
            smoke_cmd = ['node', str(TOOLS/'browser_smoke.mjs'), url]
            ready = cfg.get('validation', {}).get('readyExpression')
            if ready:
                smoke_cmd.extend(['--ready', ready])
            code = stage('Browser smoke', smoke_cmd, allow_codes={0,2})
            if code == 1:
                failures += 1

    summary = {
        'project': cfg.get('projectName'),
        'projectRoot': str(project),
        'config': str(config),
        'failures': failures,
        'status': 'PASS' if failures == 0 else 'FAIL',
        'stages': results,
    }
    (out_dir/'SUMMARY.json').write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
    print(f"\n{summary['status']}: architecture toolkit checks; failures={failures}; report={out_dir/'SUMMARY.json'}")
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
