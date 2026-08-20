#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
from common import load_json, validate_project_contract

CHAPTER_MAP = {
    "always": ["1 Normative and Evidence Terminology", "2 Architecture Project Contract", "3 Architecture Decision Framework", "4 Existing-Project Preservation", "23 Testing and Evidence Ladder", "24 Toolkit Components"],
    "dom": ["12 Rendering Path Selection", "21 Accessibility and Browser UI"],
    "canvas2d": ["8 High-DPI and Coordinate Architecture", "12 Rendering Path Selection"],
    "webgl2": ["8 High-DPI and Coordinate Architecture", "12 Rendering Path Selection", "13 WebGL2 Resource and Failure Model", "14 Lighting, Normal Maps, and Postprocessing"],
    "existing": ["4 Existing-Project Preservation", "12 Rendering Path Selection"],
    "event": ["6 Timing Models"],
    "variable": ["6 Timing Models"],
    "fixed": ["6 Timing Models"],
    "fixed_interpolated": ["6 Timing Models"],
    "generatedAssets": ["11 Asset Authority and the Three-Stage Verified Lifecycle"],
    "gamepad": ["10 Input Architecture and Analog Deadzones"],
    "webAudio": ["19 Web Audio"],
    "workers": ["18 Workers, OffscreenCanvas, and Shared Memory", "17 Memory and Performance Methodology"],
    "sharedArrayBuffer": ["18 Workers, OffscreenCanvas, and Shared Memory", "22 Security and Deployment Boundaries"],
    "postprocessing": ["14 Lighting, Normal Maps, and Postprocessing", "21 Accessibility and Browser UI"],
    "normalMapping": ["14 Lighting, Normal Maps, and Postprocessing"],
    "inverseKinematics": ["15 Animation and Camera"],
    "spatialBroadphase": ["16 Collision and Physics Escalation", "17 Memory and Performance Methodology"],
    "persistence": ["20 Persistence and Schema Evolution"],
    "deploymentAutomation": ["22 Security and Deployment Boundaries"],
}


VERIFY_MAP = {
    "dom": ["keyboard/focus path", "semantic control check"],
    "canvas2d": ["DPR/resize/pointer mapping", "browser runtime smoke"],
    "webgl2": ["context creation", "shader compile/link", "context loss/restore if owned"],
    "event": ["state transitions execute without continuous-loop assumptions"],
    "variable": ["stall/delta clamp behavior"],
    "fixed": ["max-step/backlog policy", "stable simulation integration"],
    "fixed_interpolated": ["previous/current interpolation", "teleport/snap fixture"],
    "generatedAssets": ["manifest schema", "physical file existence", "frame bounds/checksums when present"],
    "gamepad": ["deadzone center/edge/diagonal/disconnect"],
    "webAudio": ["user-activation startup", "mute/resume/failure state"],
    "workers": ["message lifecycle", "worker termination", "matched before/after measurement"],
    "sharedArrayBuffer": ["crossOriginIsolated", "COOP/COEP deployment headers", "race/synchronization test"],
    "postprocessing": ["effect on/off profile", "reduced-motion/sensory path"],
    "normalMapping": ["light-direction orientation fixture"],
    "inverseKinematics": ["reach-limit and pose edge cases"],
    "spatialBroadphase": ["candidate counts", "clustered worst-case benchmark"],
    "persistence": ["round-trip", "schema migration", "corruption/quota handling"],
    "deploymentAutomation": ["no secrets in client/logs", "authorization boundary", "dry-run/staging proof"],
}


def activated_keys(cfg: dict) -> list[str]:
    keys = [cfg["renderPath"], cfg["timingModel"]]
    caps = cfg["capabilities"]
    for key, value in caps.items():
        if key == "assetManifest":
            continue
        if key == "persistence":
            if value != "none":
                keys.append("persistence")
        elif value is True:
            keys.append(key)
    return keys


def build_report(cfg: dict, project_root: Path) -> str:
    active = activated_keys(cfg)
    chapters: list[str] = []
    for key in ["always", *active]:
        for chapter in CHAPTER_MAP.get(key, []):
            if chapter not in chapters:
                chapters.append(chapter)

    verifications: list[str] = ["linter passes with no errors", "declared validation commands are known before completion claim"]
    for key in active:
        for check in VERIFY_MAP.get(key, []):
            if check not in verifications:
                verifications.append(check)

    caps = cfg["capabilities"]
    all_optional = [
        "generatedAssets", "webAudio", "gamepad", "workers", "sharedArrayBuffer",
        "deploymentAutomation", "postprocessing", "normalMapping", "inverseKinematics",
        "spatialBroadphase",
    ]
    deactivated = [k for k in all_optional if not caps[k]]
    if caps["persistence"] == "none":
        deactivated.append("persistence")

    lines = [
        f"# Architecture Activation Report — {cfg['projectName']}",
        "",
        f"- **Project root:** `{project_root}`",
        f"- **Render path:** `{cfg['renderPath']}`",
        f"- **Timing model:** `{cfg['timingModel']}`",
        f"- **Existing framework:** `{cfg.get('existingFramework') or 'none declared'}`",
        "",
        "## Activated handbook areas",
    ]
    lines += [f"- {c}" for c in chapters]
    lines += ["", "## Mandatory verification for this contract"]
    lines += [f"- [ ] {v}" for v in verifications]
    lines += ["", "## Explicitly deactivated capabilities"]
    lines += [f"- `{d}` — do not add unless a new requirement/evidence activates it." for d in deactivated]

    if caps.get("sharedArrayBuffer"):
        headers = cfg.get("deploymentHeaders", {})
        lines += ["", "## SharedArrayBuffer deployment gate"]
        lines += [f"- COOP: `{headers.get('Cross-Origin-Opener-Policy', 'MISSING')}`"]
        lines += [f"- COEP: `{headers.get('Cross-Origin-Embedder-Policy', 'MISSING')}`"]
    return "\n".join(lines) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description="Compile a project architecture contract into activated handbook areas and proof obligations.")
    ap.add_argument("contract", type=Path)
    ap.add_argument("--project-root", type=Path, default=Path("."))
    ap.add_argument("--out", type=Path)
    args = ap.parse_args()
    cfg = load_json(args.contract)
    errors = validate_project_contract(cfg)
    if errors:
        for e in errors:
            print(f"ERROR: {e}")
        return 1
    report = build_report(cfg, args.project_root.resolve())
    if args.out:
        args.out.write_text(report, encoding="utf-8")
        print(args.out)
    else:
        print(report, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
