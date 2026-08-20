# IK Creature Sandbox

Build a creature sandbox where articulated limbs follow targets using optional IK.

## Build path
1. Use part-based assets with verified pivots from the manifest.
2. Keep IK in presentation/animation unless gameplay explicitly depends on solved limb positions.
3. Test unreachable and near-zero-distance targets.

## Toolkit commands

```bash
python ../../tools/architecture_preflight.py architecture.project.json --project-root . --out ACTIVATION.md
python ../../tools/architecture_linter.py . --config architecture.project.json
python ../../tools/checklist_generator.py architecture.project.json --out VALIDATION_CHECKLIST.md
python ../../tools/manifest_validator.py assets/manifest.json --project-root .
```

## Acceptance evidence
- [ ] IK never produces NaN at reach limits.
- [ ] Regenerated parts cannot silently change IDs/pivots.
- [ ] Draw calls do not mutate authoritative gameplay state.
