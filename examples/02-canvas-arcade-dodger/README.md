# Canvas Arcade Dodger

Build a tiny high-DPI arcade dodger with keyboard movement and simple sound effects.

## Build path
1. Use one Canvas 2D render surface with a variable-delta loop.
2. Cap large frame deltas and clear held input on blur.
3. Start/resume Web Audio from the Start button.

## Toolkit commands

```bash
python ../../tools/architecture_preflight.py architecture.project.json --project-root . --out ACTIVATION.md
python ../../tools/architecture_linter.py . --config architecture.project.json
python ../../tools/checklist_generator.py architecture.project.json --out VALIDATION_CHECKLIST.md
```

## Acceptance evidence
- [ ] Movement remains reasonable after a simulated stall.
- [ ] Resize/DPR mapping remains crisp and input aligns with drawing.
- [ ] Audio starts after user activation and mute works.
