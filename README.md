# Modern 2D Browser Game Architecture Toolkit

This repository contains:

- the **architecture toolkit** (handbook, schemas, templates, and example contracts);
- **toolkit validation tools** (linter, preflight, manifest validator, project-check runner, self-test);
- **one showcase launcher** at `showcase/`;
- **ten architecture demonstrations** that are independently runnable and reachable from that launcher.

A requirement-driven architecture handbook plus executable guardrails for humans and AI coding agents building 2D browser games.

## Governing rule

**The game's requirements determine the architecture.** Start with the simplest implementation that satisfies the real behavior/quality target. Activate advanced systems only when requirements, existing architecture, profiling, scale, browser constraints, or measured failure modes justify them.

## Run the ten-demo launcher

The launcher is a local, offline-capable browser catalog. It reads `showcase/demos.json` as the only demo list.

```bash
python3 tools/serve_showcase.py --port 8000
```

Then open:

```text
http://127.0.0.1:8000/showcase/
```

The development server binds to loopback by default and sends the cross-origin isolation headers required by Demo 10 (`COOP: same-origin`, `COEP: require-corp`, `CORP: same-origin`).

Validate the catalog, demo files, contracts, and architecture lints:

```bash
python3 tools/validate_showcase.py
```

Each demonstration can also be opened standalone from its `showcase/demos/<id>/` entry.

Architecture notes for the launcher and the ten demos: `docs/SHOWCASE_ARCHITECTURE.md`.

### Showcase demonstrations

1. **Accessible DOM Card Battler** — semantic buttons, live regions, no canvas.
2. **High-DPI Canvas Arcade Dodger** — DPR backing store, variable delta, blur-safe input.
3. **Fixed-Step Platformer** — 60 Hz simulation, interpolated presentation, gamepad deadzone.
4. **Manifest-Driven Generated-Art Adventure** — spec → local generate → hashed manifest → logical IDs.
5. **WebGL2 Particle Arena** — GLSL ES 3.00 instancing, context-loss handling, reduced effects.
6. **Accessible Puzzle Museum** — three keyboard-complete exhibits, no game loop.
7. **Two-Bone IK Creature Sandbox** — analytical IK with reach clamps and fixtures.
8. **Swarm Collision Broadphase Lab** — naive vs grid, including clustered pathology.
9. **Offline Strategy Simulation** — IndexedDB versioning plus a worker for heavy turns.
10. **Shared-Memory Field Simulator** — SharedArrayBuffer only when isolated; otherwise copy fallback.

WebGL2, workers, SharedArrayBuffer, spatial hashing, and IK are **conditional examples**. They are not a required engine profile. A game that does not need them should not activate them.

The `examples/` directory still ships architecture contracts/recipes for the same ten names. The playable implementations live under `showcase/demos/`.

## Start here

The user-facing handbook is:

- `final/MODERN_2D_BROWSER_GAME_ARCHITECTURE_TOOLKIT_FINAL.docx`
- editable source: `final/MODERN_2D_BROWSER_GAME_ARCHITECTURE_TOOLKIT_FINAL.md`

## Five-minute project setup

```bash
TOOLKIT=/absolute/path/to/modern_2d_browser_game_architecture_toolkit
cd /path/to/your/game

python "$TOOLKIT/tools/bootstrap_project.py" . --name "My Game"
# Edit architecture.project.json to describe the actual project.
python "$TOOLKIT/tools/run_project_checks.py" . --strict-lint
```

The orchestrator writes `.architecture-checks/` with activation, lint, validation-checklist, and summary outputs.

Generated-asset project:

```bash
python "$TOOLKIT/tools/run_project_checks.py" . \
  --strict-lint \
  --verify-asset-files \
  --verify-asset-hashes
```

Optional browser smoke requires Node plus a compatible Playwright installation in the environment:

```bash
python "$TOOLKIT/tools/run_project_checks.py" . --browser
```

Project validation commands are **not executed by default**. Use `--execute-project-commands` only when you intend to authorize the strings in `validation.commands`.

## Tool map

| Tool | Purpose |
|---|---|
| `bootstrap_project.py` | create project contract + ADR/task/validation templates without overwrite |
| `architecture_preflight.py` | compile contract into activated handbook areas and proof obligations |
| `architecture_linter.py` | static high-confidence contract/security/lifecycle lint |
| `manifest_validator.py` | validate generated/runtime asset manifest facts |
| `checklist_generator.py` | generate project-specific verification checklist |
| `run_project_checks.py` | one-command orchestration of project architecture checks |
| `browser_smoke.mjs` | optional Playwright runtime smoke for a running app |
| `toolkit_selftest.py` | validate the toolkit and all ten shipped example contracts |

Linter rule details: `tools/LINTER_RULES.md`.

## Requirements

- Python 3.10+; core Python tools use only the standard library.
- Node is optional and only needed for the JavaScript browser smoke syntax/runtime path.
- Playwright is optional and only needed when running `browser_smoke.mjs` / `--browser`.

## Ten example uses

1. `01-dom-card-battler` — semantic event-driven card game.
2. `02-canvas-arcade-dodger` — high-DPI Canvas variable-delta arcade game.
3. `03-fixed-platformer` — fixed-step/interpolated action platformer.
4. `04-generated-art-adventure` — manifest-governed AI-generated art pipeline.
5. `05-webgl-particle-arena` — shader/particle-driven WebGL2 arena.
6. `06-accessible-puzzle-museum` — semantic keyboard/reduced-motion puzzle collection.
7. `07-ik-creature-sandbox` — part-based generated assets with optional IK.
8. `08-swarm-collision-lab` — evidence-driven spatial broadphase benchmark.
9. `09-offline-strategy-sim` — worker + IndexedDB strategy simulation.
10. `10-shared-memory-field` — intentionally cross-origin-isolated shared-memory simulator.

Each example contains a README and complete `architecture.project.json` contract.

## CI

`templates/github-actions-architecture.yml` provides a starter pull-request check. Update the toolkit location/install method for your repository. Only enable browser smoke after the CI job starts the test server and installs Playwright.

## Toolkit self-test

```bash
python tools/toolkit_selftest.py
```

Expected final line:

```text
PASS toolkit self-test
```

## Evidence and limitations

The linter is intentionally conservative: an error represents a high-confidence violation; a warning is a review obligation, not proof of a defect. Static analysis cannot prove gameplay correctness, accessibility, performance, browser compatibility, visual quality, or resource cleanup. The handbook defines the appropriate runtime/visual/performance evidence for those claims.

Current platform source verification is recorded in `qa/SOURCE_VERIFICATION.md`.
