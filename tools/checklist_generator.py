#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
from common import load_json, validate_project_contract
from architecture_preflight import activated_keys, VERIFY_MAP


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate a project-specific validation checklist from architecture.project.json")
    ap.add_argument("contract", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()
    cfg = load_json(args.contract)
    errors = validate_project_contract(cfg)
    if errors:
        for e in errors:
            print(f"ERROR: {e}")
        return 1
    checks = [
        "Run architecture linter and resolve all ERROR findings.",
        "Run project build/type/test commands declared by the project.",
        "Exercise the user-visible path affected by the change.",
        "Record what remains unverified instead of promoting it to pass.",
    ]
    for key in activated_keys(cfg):
        for item in VERIFY_MAP.get(key, []):
            if item not in checks:
                checks.append(item)
    lines = [f"# Validation Checklist — {cfg['projectName']}", ""]
    for item in checks:
        lines.append(f"- [ ] {item}")
    commands = cfg["validation"].get("commands", [])
    if commands:
        lines += ["", "## Declared project commands", "", "```bash", *commands, "```"]
    if cfg["validation"].get("browserUrl"):
        lines += ["", "## Browser smoke", "", f"URL: `{cfg['validation']['browserUrl']}`"]
        if cfg["validation"].get("readyExpression"):
            lines.append(f"Ready expression: `{cfg['validation']['readyExpression']}`")
    args.out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(args.out)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
