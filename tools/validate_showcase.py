#!/usr/bin/env python3
"""Validate the ten-demo showcase contract, files, and architecture lints."""
from __future__ import annotations

import json
import py_compile
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
SHOWCASE = ROOT / "showcase"
sys.path.insert(0, str(TOOLS))

from architecture_linter import lint  # noqa: E402
from common import load_json, validate_project_contract  # noqa: E402
from serve_showcase import ISOLATION_HEADERS  # noqa: E402

REQUIRED_IDS = [
    "01-accessible-card-battler",
    "02-canvas-arcade-dodger",
    "03-fixed-step-platformer",
    "04-manifest-adventure",
    "05-webgl2-particle-arena",
    "06-accessible-puzzle-museum",
    "07-ik-creature-sandbox",
    "08-swarm-collision-lab",
    "09-offline-strategy-sim",
    "10-shared-memory-field-sim",
]

REQUIRED_DEMO_FILES = [
    "index.html",
    "main.js",
    "architecture.project.json",
    "README.md",
]

WORKER_DEMOS = {
    "09-offline-strategy-sim",
    "10-shared-memory-field-sim",
}

LAUNCHER_FILES = [
    SHOWCASE / "index.html",
    SHOWCASE / "styles.css",
    SHOWCASE / "app.js",
    SHOWCASE / "demos.json",
    SHOWCASE / "shared" / "demo-shell.css",
    SHOWCASE / "shared" / "demo-utils.js",
    TOOLS / "serve_showcase.py",
    TOOLS / "validate_showcase.py",
]


def fail(errors: list[str]) -> int:
    for item in errors:
        print(f"FAIL: {item}", file=sys.stderr)
    print(f"FAIL showcase validation; errors={len(errors)}")
    return 1


def main() -> int:
    errors: list[str] = []

    for path in (TOOLS / "serve_showcase.py", TOOLS / "validate_showcase.py"):
        try:
            py_compile.compile(str(path), doraise=True)
        except py_compile.PyCompileError as exc:
            errors.append(f"python syntax: {path.name}: {exc}")

    for path in LAUNCHER_FILES:
        if not path.is_file():
            errors.append(f"missing launcher file: {path.relative_to(ROOT)}")

    expected = {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Resource-Policy": "same-origin",
    }
    if ISOLATION_HEADERS != expected:
        errors.append(f"serve_showcase isolation headers mismatch: {ISOLATION_HEADERS}")

    demos_path = SHOWCASE / "demos.json"
    if not demos_path.is_file():
        errors.append("showcase/demos.json is missing")
        return fail(errors)

    try:
        catalog = json.loads(demos_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"demos.json is not valid JSON: {exc}")
        return fail(errors)

    if not isinstance(catalog, dict) or not isinstance(catalog.get("demos"), list):
        errors.append("demos.json must be an object with a demos array")
        return fail(errors)

    demos = catalog["demos"]
    if len(demos) != 10:
        errors.append(f"expected exactly 10 demos, found {len(demos)}")

    ids: list[str] = []
    numbers: list[int] = []
    for index, demo in enumerate(demos):
        prefix = f"demos[{index}]"
        if not isinstance(demo, dict):
            errors.append(f"{prefix} must be an object")
            continue
        for key in ("id", "number", "title", "path", "architecture", "capabilities", "summary"):
            if key not in demo:
                errors.append(f"{prefix} missing {key}")
        demo_id = demo.get("id")
        number = demo.get("number")
        if isinstance(demo_id, str):
            ids.append(demo_id)
        if isinstance(number, int):
            numbers.append(number)
        if not isinstance(demo.get("capabilities"), list):
            errors.append(f"{prefix}.capabilities must be an array")
        if not isinstance(demo.get("title"), str) or not demo.get("title"):
            errors.append(f"{prefix}.title must be a non-empty string")
        if not isinstance(demo.get("architecture"), str) or not demo.get("architecture"):
            errors.append(f"{prefix}.architecture must be a non-empty string")
        if not isinstance(demo.get("summary"), str) or not demo.get("summary"):
            errors.append(f"{prefix}.summary must be a non-empty string")
        rel = demo.get("path")
        if not isinstance(rel, str) or not rel:
            errors.append(f"{prefix}.path must be a non-empty string")
            continue
        resolved = (SHOWCASE / rel).resolve()
        try:
            resolved.relative_to(SHOWCASE.resolve())
        except ValueError:
            errors.append(f"{prefix}.path escapes showcase/: {rel}")
            continue
        if not resolved.exists():
            errors.append(f"{prefix}.path does not exist: {rel}")

    unknown = [demo_id for demo_id in ids if demo_id not in REQUIRED_IDS]
    missing = [demo_id for demo_id in REQUIRED_IDS if demo_id not in ids]
    if unknown:
        errors.append(f"unknown demo ids in demos.json: {unknown}")
    if missing:
        errors.append(f"required demo ids missing from demos.json: {missing}")
    if len(ids) != len(set(ids)):
        errors.append("demo ids are not unique")
    if sorted(numbers) != list(range(1, 11)):
        errors.append(f"demo numbers must be 1-10 exactly once; found {sorted(numbers)}")

    for demo_id in REQUIRED_IDS:
        demo_dir = SHOWCASE / "demos" / demo_id
        if not demo_dir.is_dir():
            errors.append(f"required demo directory absent: showcase/demos/{demo_id}")
            continue
        for name in REQUIRED_DEMO_FILES:
            if not (demo_dir / name).is_file():
                errors.append(f"{demo_id} missing {name}")
        if demo_id in WORKER_DEMOS and not (demo_dir / "worker.js").is_file():
            errors.append(f"{demo_id} missing worker.js")
        contract_path = demo_dir / "architecture.project.json"
        if not contract_path.is_file():
            continue
        try:
            cfg = load_json(contract_path)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{demo_id}: architecture.project.json parse error: {exc}")
            continue
        contract_errors = validate_project_contract(cfg)
        if contract_errors:
            errors.append(f"{demo_id}: invalid contract: {contract_errors}")
            continue
        findings = lint(demo_dir, cfg)
        lint_errors = [item for item in findings if item["severity"] == "error"]
        if lint_errors:
            errors.append(f"{demo_id}: linter errors: {lint_errors}")
        else:
            print(f"PASS architecture lint {demo_id}")

    if errors:
        return fail(errors)

    print("PASS showcase validation; demos=10")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
