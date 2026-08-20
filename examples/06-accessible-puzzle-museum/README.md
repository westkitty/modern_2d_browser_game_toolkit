# Accessible Puzzle Museum

Build a keyboard- and screen-reader-friendly puzzle collection with no continuous game loop.

## Build path
1. Use semantic DOM controls and visible focus.
2. Respect reduced motion; animate only decorative transitions.
3. Treat local persistence as replaceable device state.

## Toolkit commands

```bash
python ../../tools/architecture_preflight.py architecture.project.json --project-root . --out ACTIVATION.md
python ../../tools/architecture_linter.py . --config architecture.project.json
python ../../tools/checklist_generator.py architecture.project.json --out VALIDATION_CHECKLIST.md
```

## Acceptance evidence
- [ ] Every puzzle is solvable with keyboard only.
- [ ] Focus never becomes trapped.
- [ ] Reduced-motion preference removes nonessential motion.
