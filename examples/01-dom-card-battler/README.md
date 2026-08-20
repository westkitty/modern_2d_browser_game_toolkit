# DOM Card Battler

Build an accessible turn-based card battler with semantic buttons, keyboard play, and saved settings.

## Build path
1. Use DOM/CSS for cards and controls; do not create a canvas renderer.
2. Drive turns from events/state transitions rather than requestAnimationFrame.
3. Persist deck/settings with schemaVersion in localStorage.

## Toolkit commands

```bash
python ../../tools/architecture_preflight.py architecture.project.json --project-root . --out ACTIVATION.md
python ../../tools/architecture_linter.py . --config architecture.project.json
python ../../tools/checklist_generator.py architecture.project.json --out VALIDATION_CHECKLIST.md
```

## Acceptance evidence
- [ ] Keyboard-only match can be completed.
- [ ] Reload preserves settings without corrupting old saves.
- [ ] Linter reports no client secret or lifecycle errors.
