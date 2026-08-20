# Generated-Art Top-Down Adventure

Build a top-down adventure whose AI-generated art is integrated only through verified manifest facts.

## Build path
1. Generate/build assets first and emit assets/manifest.json.
2. Runtime references logical asset IDs rather than invented file names.
3. Use IndexedDB for saves with versioned migrations.

## Toolkit commands

```bash
python ../../tools/architecture_preflight.py architecture.project.json --project-root . --out ACTIVATION.md
python ../../tools/architecture_linter.py . --config architecture.project.json
python ../../tools/checklist_generator.py architecture.project.json --out VALIDATION_CHECKLIST.md
python ../../tools/manifest_validator.py assets/manifest.json --project-root .
```

## Acceptance evidence
- [ ] Manifest validator passes frame bounds and file existence.
- [ ] Unknown asset IDs fail explicitly.
- [ ] Save round-trip and one migration fixture pass.
