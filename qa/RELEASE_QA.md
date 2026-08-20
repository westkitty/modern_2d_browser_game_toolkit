# Release QA Gates

| Gate | Status | Evidence |
|---|---|---|
| final handbook exists | pass | DOCX/Markdown/PDF in `final/` |
| linter exists and detects negative fixture | pass | `toolkit_selftest.py` synthetic SEC003/WEBGL101 fixture |
| manifest validator rejects bad bounds | pass | self-test MAN024 fixture |
| preflight/checklist work | pass | all ten example contracts self-tested |
| exactly ten usage examples | pass | `examples/01-*` through `examples/10-*` |
| orchestrator works | pass | example 04 and 10 spot logs |
| DOCX render | pass | 42 rendered pages |
| DOCX visual QA | pass | complete contact-sheet review + direct front-matter inspection |
| DOCX accessibility | pass | high=0 medium=0 low=0 |
| source verification | pass | `SOURCE_VERIFICATION.md` |
| secrets/privacy review | pass with declared fixture | synthetic `sk-proj-...` string appears only in linter negative self-test; not a live credential |
| browser smoke real-project execution | not applicable to toolkit release | requires target app/server and Playwright |
| deployment/upload | not applicable | toolkit performs no deployment |

## Packaged-copy verification

- `python tools/toolkit_selftest.py` executed from the staged release: PASS for all ten example contracts.
- `CHECKSUMS.sha256` verification of the staged release's originally listed files: PASS before manifest refresh.
- `browser_smoke.mjs` dependency-path execution: exit 2 with explicit Playwright-missing SKIP, as designed; no false PASS.
