#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from common import load_json, sha256_file

SUPPORTED_KINDS = {"atlasFrame", "image", "audio", "font", "shader", "data"}


def is_obj(v):
    return isinstance(v, dict)


def int_at_least(v, minimum):
    return isinstance(v, int) and not isinstance(v, bool) and v >= minimum


def validate(manifest: dict, manifest_path: Path, project_root: Path, verify_files: bool, verify_hashes: bool):
    findings = []
    def add(sev, code, msg): findings.append({"severity": sev, "code": code, "message": msg})
    if not is_obj(manifest):
        add("error", "MAN000", "manifest root must be object")
        return findings
    if manifest.get("schemaVersion") != 1:
        add("error", "MAN001", "schemaVersion must be 1")
    atlases = manifest.get("atlases")
    assets = manifest.get("assets")
    if not is_obj(atlases):
        add("error", "MAN002", "atlases must be object")
        atlases = {}
    if not is_obj(assets):
        add("error", "MAN003", "assets must be object")
        assets = {}

    base = manifest_path.parent
    physical: list[tuple[str, str, str | None]] = []
    for aid, meta in atlases.items():
        if not is_obj(meta):
            add("error", "MAN010", f"atlas {aid}: metadata must be object")
            continue
        image = meta.get("image")
        if not isinstance(image, str) or not image:
            add("error", "MAN011", f"atlas {aid}: image must be non-empty string")
        if not int_at_least(meta.get("width"), 1) or not int_at_least(meta.get("height"), 1):
            add("error", "MAN012", f"atlas {aid}: width/height must be positive integers")
        if isinstance(image, str): physical.append((f"atlas:{aid}", image, meta.get("sha256")))

    for asset_id, asset in assets.items():
        if not is_obj(asset):
            add("error", "MAN020", f"asset {asset_id}: must be object")
            continue
        kind = asset.get("kind")
        if kind not in SUPPORTED_KINDS:
            add("error", "MAN021", f"asset {asset_id}: unsupported kind {kind!r}")
            continue
        if kind == "atlasFrame":
            atlas_id = asset.get("atlas")
            if not isinstance(atlas_id, str) or atlas_id not in atlases:
                add("error", "MAN022", f"asset {asset_id}: unknown atlas {atlas_id!r}")
                continue
            frame = asset.get("frame")
            if not is_obj(frame) or not all(int_at_least(frame.get(k), 0 if k in {"x","y"} else 1) for k in ("x","y","w","h")):
                add("error", "MAN023", f"asset {asset_id}: invalid frame")
                continue
            atlas = atlases[atlas_id]
            if int_at_least(atlas.get("width"), 1) and int_at_least(atlas.get("height"), 1):
                if frame["x"] + frame["w"] > atlas["width"] or frame["y"] + frame["h"] > atlas["height"]:
                    add("error", "MAN024", f"asset {asset_id}: frame exceeds atlas bounds")
        else:
            path = asset.get("path")
            if not isinstance(path, str) or not path:
                add("error", "MAN025", f"asset {asset_id}: {kind} requires path")
            else:
                physical.append((f"asset:{asset_id}", path, asset.get("sha256")))

    if verify_files:
        for logical, rel, expected in physical:
            p = (base / rel).resolve()
            try:
                p.relative_to(project_root.resolve())
            except ValueError:
                add("error", "MAN030", f"{logical}: path escapes project root: {rel}")
                continue
            if not p.is_file():
                add("error", "MAN031", f"{logical}: missing file {rel}")
                continue
            if verify_hashes and expected:
                got = sha256_file(p)
                if got.lower() != expected.lower():
                    add("error", "MAN032", f"{logical}: sha256 mismatch")
    return findings


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate verified asset manifests without third-party Python dependencies.")
    ap.add_argument("manifest", type=Path)
    ap.add_argument("--project-root", type=Path)
    ap.add_argument("--verify-files", action="store_true")
    ap.add_argument("--verify-hashes", action="store_true")
    ap.add_argument("--json", type=Path)
    args = ap.parse_args()
    manifest_path = args.manifest.resolve()
    root = (args.project_root or manifest_path.parent).resolve()
    findings = validate(load_json(manifest_path), manifest_path, root, args.verify_files, args.verify_hashes)
    errors = [f for f in findings if f["severity"] == "error"]
    for f in findings:
        print(f"{f['severity'].upper()} {f['code']}: {f['message']}")
    if not findings:
        print("PASS: manifest validated")
    if args.json:
        args.json.write_text(json.dumps({"findings": findings, "errorCount": len(errors)}, indent=2), encoding="utf-8")
    return 1 if errors else 0

if __name__ == "__main__":
    raise SystemExit(main())
