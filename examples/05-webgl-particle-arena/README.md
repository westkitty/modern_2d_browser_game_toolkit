# WebGL Particle Arena

Build a twin-stick arena with shader-driven effects and a measured GPU-oriented render path.

## Build path
1. Use WebGL2 because the visual design requires custom shaders/particles, not because of a sprite-count superstition.
2. Batch compatible sprites only after defining blend/sort boundaries.
3. Provide an effects-reduction path for bloom/shake.

## Toolkit commands

```bash
python ../../tools/architecture_preflight.py architecture.project.json --project-root . --out ACTIVATION.md
python ../../tools/architecture_linter.py . --config architecture.project.json
python ../../tools/checklist_generator.py architecture.project.json --out VALIDATION_CHECKLIST.md
```

## Acceptance evidence
- [ ] Shader compile/link errors are surfaced.
- [ ] Effect-on/off profiling is recorded.
- [ ] Context-loss recovery is exercised if the project owns WebGL resources.
