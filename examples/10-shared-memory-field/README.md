# Cross-Origin-Isolated Field Simulator

Build an advanced field/particle simulator that intentionally uses shared memory under cross-origin isolation.

## Build path
1. Use SharedArrayBuffer only because transfer/copy overhead is demonstrated to be material.
2. Deploy with COOP same-origin and COEP require-corp (or justified credentialless).
3. Keep a non-shared fallback or explicit unsupported state.

## Toolkit commands

```bash
python ../../tools/architecture_preflight.py architecture.project.json --project-root . --out ACTIVATION.md
python ../../tools/architecture_linter.py . --config architecture.project.json
python ../../tools/checklist_generator.py architecture.project.json --out VALIDATION_CHECKLIST.md
```

## Acceptance evidence
- [ ] window.crossOriginIsolated is true in the deployed test.
- [ ] Headers do not break required third-party resources silently.
- [ ] Shared-memory synchronization/race fixtures pass.
