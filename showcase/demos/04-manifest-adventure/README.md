# Manifest-Driven Generated-Art Adventure

A tiny top-down meadow whose sprites are produced by a local pipeline and consumed only through logical IDs.

## Pipeline

1. Edit `asset-spec/adventure-assets.json`.
2. Run `python3 scripts/generate_assets.py`.
3. That writes physical SVG files and `assets/manifest.json` with SHA-256 hashes.
4. Validate: `python3 ../../../tools/manifest_validator.py assets/manifest.json --project-root . --verify-files --verify-hashes`.
5. Runtime loads IDs such as `player` and `chest`. Unknown IDs throw.

This does not call a paid image API. The architecture lesson is manifest authority.

## Play

WASD/arrows move. Approach the chest and press E or Space.

Deleting or renaming a generated file fails `--verify-files`. Inventing atlas coordinates is not possible: there is no atlas, and the loader refuses missing IDs.
