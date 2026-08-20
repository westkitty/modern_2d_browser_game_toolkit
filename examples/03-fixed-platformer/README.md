# Fixed-Step Platformer

Build a platformer whose collision simulation is stable while rendering smoothly on high-refresh displays.

## Build path
1. Use fixed simulation steps and interpolate only presentation transforms.
2. Use action mapping for keyboard/gamepad and scaled radial deadzones.
3. Start with AABB collision; add broadphase only if profiling requires it.

## Toolkit commands

```bash
python ../../tools/architecture_preflight.py architecture.project.json --project-root . --out ACTIVATION.md
python ../../tools/architecture_linter.py . --config architecture.project.json
python ../../tools/checklist_generator.py architecture.project.json --out VALIDATION_CHECKLIST.md
```

## Acceptance evidence
- [ ] Simulation step count is bounded during stalls.
- [ ] Teleports/respawns snap interpolation history.
- [ ] Controller deadzone edge and diagonal fixtures pass.
