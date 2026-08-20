# Showcase architecture

The launcher exists to prove the handbook rule: **the game's requirements determine the architecture.** Ten independently runnable demonstrations share a catalog, not an engine.

## Launcher structure

- `showcase/index.html`, `styles.css`, and `app.js` render the catalog.
- `showcase/demos.json` is the only demo list. The launcher does not keep a second hardcoded roster.
- `showcase/shared/` holds demo-shell CSS and small boot utilities, including `__DEMO_STATUS__`.
- `tools/serve_showcase.py` serves the repository on loopback with COOP/COEP/CORP isolation headers.
- `tools/validate_showcase.py` checks catalog shape, files, contracts, and invokes the existing architecture linter.

Each demo can run inside the launcher iframe or as `showcase/demos/<id>/index.html`.

## Demo contract

Every demonstration directory contains:

- `index.html` and `main.js` (plus `worker.js` when a worker is justified)
- `architecture.project.json` using the toolkit schema
- `README.md` stating why that architecture was chosen

Runtime status:

```js
window.__DEMO_STATUS__ = { id, state: "ready" | "error", error }
```

Ready is published only after initialization succeeds.

## Per-demo architecture selection

| # | Demo | Why this architecture |
|---|---|---|
| 01 | Accessible DOM Card Battler | Discrete turns are UI events, not a render loop. |
| 02 | High-DPI Canvas Arcade Dodger | Continuous motion needs pixels and variable delta with a clamped stall. |
| 03 | Fixed-Step Platformer | Jump/AABB stability needs a bounded fixed step; interpolation is presentation. |
| 04 | Manifest-Driven Adventure | Generated art is consumed only through a validated manifest of logical IDs. |
| 05 | WebGL2 Particle Arena | Particle count justifies GPU instancing; Canvas 2D would hide the lesson. |
| 06 | Accessible Puzzle Museum | Puzzles are documents and focus, not a canvas. |
| 07 | Two-Bone IK Creature Sandbox | A two-segment limb has a closed-form solver; CCD is unnecessary. |
| 08 | Swarm Collision Broadphase Lab | Naive vs grid must be measured, including clustered pathology. |
| 09 | Offline Strategy Simulation | Heavy turns belong in a worker; versioned documents belong in IndexedDB. |
| 10 | Shared-Memory Field Simulator | SAB is security-gated; a copy fallback remains when isolation is absent. |

Advanced capabilities (WebGL2, workers, SharedArrayBuffer, spatial hashing, IK) are **conditional examples**, not mandatory engine requirements.

## Validation flow

1. `python3 tools/validate_showcase.py`
2. `python3 tools/run_project_checks.py showcase/demos/<id> --strict-lint`
3. Generated-art demo also uses `--verify-asset-files --verify-asset-hashes`
4. Direct fixtures such as `node ik.test.mjs` and `node deadzone.test.mjs`
5. Optional Playwright smoke remains optional; missing Playwright is a skip, not a pass
