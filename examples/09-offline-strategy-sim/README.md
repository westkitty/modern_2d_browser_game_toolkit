# Offline Strategy Sim

Build an offline-first strategy/management simulation with heavy turn calculations moved to a worker only after profiling.

## Build path
1. Keep UI/event orchestration on main thread.
2. Use a Worker for bounded pure turn-resolution work with explicit message schemas.
3. Store larger structured save data in IndexedDB with migration handling.

## Toolkit commands

```bash
python ../../tools/architecture_preflight.py architecture.project.json --project-root . --out ACTIVATION.md
python ../../tools/architecture_linter.py . --config architecture.project.json
python ../../tools/checklist_generator.py architecture.project.json --out VALIDATION_CHECKLIST.md
```

## Acceptance evidence
- [ ] Worker can be terminated/restarted cleanly.
- [ ] Main-thread responsiveness improves in a matched trace.
- [ ] Blocked IndexedDB upgrade and quota failure have explicit behavior.
