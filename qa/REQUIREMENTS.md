# Requirement Traceability Ledger

| ID | Source | Requirement | Class | Strength | Verification | Status |
|---|---|---|---|---|---|---|
| R01 | User | Deliver one final authoritative full document, not another critique or fragment. | deliverable | mandatory | Final DOCX and Markdown exist; DOCX render QA passes. | Pass |
| R02 | User | Preserve the document's requirement-driven architecture doctrine while making it practically usable. | content/preservation | mandatory | Governing principle and evidence-based escalation are present in final document. | Pass |
| R03 | User | Provide necessary tooling around the document, explicitly including a linter. | tooling | mandatory | Runnable linter plus supporting toolkit files exist and are documented. | Pass |
| R04 | User | Add other tooling judged necessary to make the handbook operational rather than passive. | tooling | mandatory | Preflight, manifest validator, checklist generator, browser smoke harness, schemas/templates, and self-test exist. | Pass |
| R05 | User | Give ten examples of how to use the document to make something. | quantity/content | mandatory | Exactly 10 build recipes appear in the final document and as example contracts. | Pass |
| R06 | Inferred from “actually useful” | Tools must be runnable, not pseudocode-only. | behavior | mandatory | Python tools compile and self-tests execute; Node smoke tool syntax checks. | Pass |
| R07 | Artifact workflow | Package the final document and toolkit coherently for handoff. | packaging | mandatory | ZIP includes final/source/tools/schemas/templates/examples/qa plus README, manifest, checksums. | Pass |
| R08 | DOCX workflow | Final DOCX must be rendered and visually inspected before delivery. | validation | mandatory | render_docx.py produces pages; visual QA performed; defects repaired if found. | Pass |
| R09 | Technical integrity | External browser/API claims used by the handbook must be source-verified against current primary/official documentation. | validation | mandatory | Source map in final document and QA notes records verified claims. | Pass |
| R10 | Safety/security | Tooling must not encourage secret exposure or destructive deployment behavior. | prohibition | mandatory | Security linter rules + handbook boundaries + no privileged deploy helper. | Pass |

## Final evidence

- R01: final handbook Markdown/DOCX/PDF exist; DOCX rendered to 42 pages and visually inspected.
- R02: governing requirement-driven doctrine is explicit in handbook and project contract workflow.
- R03: `tools/architecture_linter.py` plus documented rule catalog; negative fixtures prove selected rules trigger.
- R04: preflight, manifest validator, checklist generator, orchestrator, browser smoke, bootstrapper, schemas/templates, CI starter, and self-test included.
- R05: exactly ten example directories and ten embedded handbook examples.
- R06: `python tools/toolkit_selftest.py` PASS; orchestrator spot tests PASS.
- R07: release package is staged with README/manifest/checksums/release notes.
- R08: canonical DOCX render + full-page-set inspection completed.
- R09: source verification recorded in `qa/SOURCE_VERIFICATION.md`.
- R10: no deployment is performed; security rules forbid client secrets/privileged deployment patterns. Synthetic secret string exists only in a negative linter fixture.
