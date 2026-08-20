#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

VALID_RENDER_PATHS = {"dom", "canvas2d", "webgl2", "existing"}
VALID_TIMING_MODELS = {"event", "variable", "fixed", "fixed_interpolated"}
VALID_PERSISTENCE = {"none", "localStorage", "indexedDB"}


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def dump_json(data: Any) -> str:
    return json.dumps(data, indent=2, sort_keys=True)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def validate_project_contract(data: Any) -> list[str]:
    errors: list[str] = []
    if not isinstance(data, dict):
        return ["contract root must be a JSON object"]
    if data.get("schemaVersion") != 1:
        errors.append("schemaVersion must be 1")
    if not isinstance(data.get("projectName"), str) or not data.get("projectName", "").strip():
        errors.append("projectName must be a non-empty string")
    if data.get("renderPath") not in VALID_RENDER_PATHS:
        errors.append(f"renderPath must be one of {sorted(VALID_RENDER_PATHS)}")
    if data.get("timingModel") not in VALID_TIMING_MODELS:
        errors.append(f"timingModel must be one of {sorted(VALID_TIMING_MODELS)}")

    caps = data.get("capabilities")
    if not isinstance(caps, dict):
        errors.append("capabilities must be an object")
        return errors

    bool_caps = [
        "generatedAssets", "webAudio", "gamepad", "workers", "sharedArrayBuffer",
        "deploymentAutomation", "postprocessing", "normalMapping", "inverseKinematics",
        "spatialBroadphase",
    ]
    for key in bool_caps:
        if not isinstance(caps.get(key), bool):
            errors.append(f"capabilities.{key} must be boolean")
    if caps.get("persistence") not in VALID_PERSISTENCE:
        errors.append(f"capabilities.persistence must be one of {sorted(VALID_PERSISTENCE)}")
    if caps.get("generatedAssets") and not isinstance(caps.get("assetManifest"), str):
        errors.append("capabilities.assetManifest must be a path when generatedAssets=true")
    if caps.get("sharedArrayBuffer") and not caps.get("workers"):
        errors.append("sharedArrayBuffer=true requires workers=true")

    paths = data.get("paths")
    if not isinstance(paths, dict):
        errors.append("paths must be an object")
    else:
        for key in ("frontend", "ignore", "allowedAssetLiteralFiles"):
            value = paths.get(key)
            if not isinstance(value, list) or not all(isinstance(x, str) for x in value):
                errors.append(f"paths.{key} must be an array of strings")

    lint_cfg = data.get("lint", {})
    if not isinstance(lint_cfg, dict):
        errors.append("lint must be an object when present")
    else:
        for key in ("ignoreCodes", "ignorePaths"):
            value = lint_cfg.get(key, [])
            if not isinstance(value, list) or not all(isinstance(x, str) for x in value):
                errors.append(f"lint.{key} must be an array of strings")

    validation = data.get("validation")
    if not isinstance(validation, dict):
        errors.append("validation must be an object")
    else:
        commands = validation.get("commands")
        if not isinstance(commands, list) or not all(isinstance(x, str) for x in commands):
            errors.append("validation.commands must be an array of strings")
        for key in ("browserUrl", "readyExpression"):
            if validation.get(key) is not None and not isinstance(validation.get(key), str):
                errors.append(f"validation.{key} must be string or null")

    return errors


def relative_to_any(path: Path, roots: list[Path]) -> bool:
    for root in roots:
        try:
            path.relative_to(root)
            return True
        except ValueError:
            pass
    return False
