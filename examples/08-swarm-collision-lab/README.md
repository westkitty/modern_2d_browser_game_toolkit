# Swarm Collision Lab

Build a collision benchmark that compares naive pairs with a spatial broadphase under representative clustered and uniform scenes.

## Build path
1. Keep both baseline and broadphase implementations for matched comparison.
2. Record candidate-pair counts and broadphase time.
3. Treat cell size as a benchmark parameter, not a magic constant.

## Toolkit commands

```bash
python ../../tools/architecture_preflight.py architecture.project.json --project-root . --out ACTIVATION.md
python ../../tools/architecture_linter.py . --config architecture.project.json
python ../../tools/checklist_generator.py architecture.project.json --out VALIDATION_CHECKLIST.md
```

## Acceptance evidence
- [ ] Broadphase only wins are retained.
- [ ] Clustered worst case is measured.
- [ ] No claim of universal O(N) behavior appears in results.
