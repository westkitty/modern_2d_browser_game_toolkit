#!/usr/bin/env python3
"""Deterministic local art generation for the manifest-driven adventure."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

DEMO = Path(__file__).resolve().parents[1]
SPEC_PATH = DEMO / "asset-spec" / "adventure-assets.json"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def svg_for(asset: dict, tile: int) -> str:
    fill = asset["fill"]
    mark = asset["mark"]
    role = asset["role"]
    label = asset["id"][:1].upper()
    if role == "avatar":
        body = f'<circle cx="{tile/2}" cy="{tile/2}" r="{tile/2 - 3}" fill="{fill}"/><circle cx="{tile/2}" cy="{tile/2}" r="6" fill="{mark}"/>'
    elif role == "ground":
        body = f'<rect width="{tile}" height="{tile}" fill="{fill}"/><path d="M4 {tile-6}h6m6 0h6m6 0h6" stroke="{mark}" stroke-width="2"/>'
    elif asset["id"] == "tree":
        body = (
            f'<rect x="{tile/2 - 3}" y="{tile/2}" width="6" height="{tile/2 - 2}" fill="{mark}"/>'
            f'<circle cx="{tile/2}" cy="{tile/2 - 2}" r="10" fill="{fill}"/>'
        )
    elif asset["id"] == "well":
        body = (
            f'<rect x="6" y="10" width="{tile-12}" height="{tile-14}" fill="{fill}"/>'
            f'<ellipse cx="{tile/2}" cy="14" rx="10" ry="5" fill="{mark}"/>'
        )
    else:
        body = f'<rect x="4" y="8" width="{tile-8}" height="{tile-12}" rx="3" fill="{fill}"/><rect x="8" y="14" width="{tile-16}" height="6" fill="{mark}"/>'
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{tile}" height="{tile}" viewBox="0 0 {tile} {tile}">'
        f"{body}"
        f'<text x="4" y="{tile-4}" font-size="8" fill="#12202b">{label}</text>'
        "</svg>\n"
    )


def main() -> int:
    spec = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
    out_dir = DEMO / spec["outputDir"]
    out_dir.mkdir(parents=True, exist_ok=True)
    tile = int(spec["tileSize"])
    assets: dict[str, dict] = {}
    for asset in spec["assets"]:
        svg = svg_for(asset, tile)
        data = svg.encode("utf-8")
        path = out_dir / asset["file"]
        path.write_bytes(data)
        assets[asset["id"]] = {
            "kind": asset["kind"],
            "path": asset["file"],
            "sha256": sha256_bytes(data),
            "role": asset["role"],
        }
    manifest = {"schemaVersion": 1, "atlases": {}, "assets": assets}
    manifest_path = DEMO / spec["manifest"]
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(assets)} assets and {manifest_path.relative_to(DEMO)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
