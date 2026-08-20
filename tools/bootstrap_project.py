#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path


def bootstrap_project(project_root: Path, name: str, template_root: Path) -> Path:
    root = project_root.resolve()
    root.mkdir(parents=True, exist_ok=True)
    dest = root / 'architecture.project.json'
    if dest.exists():
        raise FileExistsError(f'{dest} already exists')
    data = json.loads((template_root / 'architecture.project.json').read_text(encoding='utf-8'))
    data['projectName'] = name
    dest.write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
    for filename in ('ADR.md', 'AI_TASK_PACKET.md', 'VALIDATION_REPORT.md'):
        target = root / 'docs' / 'architecture' / filename
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(template_root / filename, target)
    return dest


def main() -> int:
    ap = argparse.ArgumentParser(description='Install the architecture contract template into a project without overwriting existing files.')
    ap.add_argument('project_root', type=Path)
    ap.add_argument('--name', required=True)
    ap.add_argument('--template-root', type=Path, default=Path(__file__).resolve().parents[1] / 'templates')
    args = ap.parse_args()
    try:
        dest = bootstrap_project(args.project_root, args.name, args.template_root)
    except FileExistsError as e:
        print(f'BLOCKED: {e}')
        return 1
    print(dest)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
