# Operational State: Modern 2D Browser Game Architecture Toolkit

<!-- operational-state:metadata
{
  "artifact_path": "",
  "current_baseline": {
    "identity": "Modern 2D Browser Game Architecture Toolkit v2.0",
    "last_verified": "2026-08-18T18:45:00Z",
    "state": "current-baseline"
  },
  "last_updated": "2026-08-18T18:47:32Z",
  "linked_parent_state": null,
  "project_id": "modern-2d-browser-game-architecture-toolkit",
  "project_name": "Modern 2D Browser Game Architecture Toolkit",
  "project_root": "/mnt/data/modern_2d_browser_game_architecture_toolkit",
  "schema_version": 1,
  "scope_boundaries": [
    "Project rooted at /mnt/data/modern_2d_browser_game_architecture_toolkit"
  ],
  "state_revision": 2
}
-->

## 1. Project Identity and Scope

- **Project ID:** `modern-2d-browser-game-architecture-toolkit`
- **Purpose:** Preserve current operational truth for Modern 2D Browser Game Architecture Toolkit.
- **Project type:** Unclassified durable artifact project.
- **Primary root or artifact:** `/mnt/data/modern_2d_browser_game_architecture_toolkit`
- **Target environment:** Unknown until established by project evidence.
- **Canonical authority:** Explicit user instruction and project-local evidence.
- **Governed scope:** Project rooted at /mnt/data/modern_2d_browser_game_architecture_toolkit
- **Explicitly not governed:** Unrelated projects and neighboring subsystems unless explicitly linked.

## 2. Current Baseline

- **Primary artifact:** `Not yet established`
- **Baseline state:** `unknown`
- **Source/build/install identity:** Unknown unless recorded below.
- **Active default user route:** Unknown unless recorded below.
- **Delivery state:** Unknown unless recorded below.
- **Last verified baseline:** Not yet established.

## 3. Artifact Contract

Record the literal deliverable shape, file count and type, dimensions, runtime behavior, user journey, dependencies, packaging, delivery, and prohibited substitutions.

## 4. Active Invariants

Add stable `INV-###` entries for rules future work must preserve.

<!-- operational-state:entry
{
  "authority": "Controlling user request and source doctrine",
  "evidence": "Final handbook governing principle and architecture.project.json workflow",
  "id": "INV-001",
  "last_checked": "v2.0 release",
  "recheck_trigger": "Any handbook architecture-rule, preflight-map, example-contract, or agent-contract change",
  "rule": "Begin with the simplest architecture sufficient for the actual project and activate specialized capabilities only from requirements, existing architecture, profiling, browser constraints, or measured failure modes.",
  "scope": "Handbook, project contract, tools, examples, and agent operating contract",
  "state": "requested",
  "status": "active",
  "title": "Requirements determine architecture",
  "validation_method": "Review preflight map, examples, linter behavior, and handbook for unconditional capability mandates."
}
-->
### INV-001 — Requirements determine architecture

- **State:** `requested`
- **Authority:** Controlling user request and source doctrine
- **Evidence:** Final handbook governing principle and architecture.project.json workflow
- **Last Checked:** v2.0 release
- **Recheck Trigger:** Any handbook architecture-rule, preflight-map, example-contract, or agent-contract change
- **Rule:** Begin with the simplest architecture sufficient for the actual project and activate specialized capabilities only from requirements, existing architecture, profiling, browser constraints, or measured failure modes.
- **Scope:** Handbook, project contract, tools, examples, and agent operating contract
- **Status:** active
- **Validation Method:** Review preflight map, examples, linter behavior, and handbook for unconditional capability mandates.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "authority": "Final handbook and user-approved architecture doctrine",
  "evidence": "Manifest validator, generated-asset examples, handbook Part III",
  "id": "INV-002",
  "last_checked": "v2.0 release",
  "recheck_trigger": "Any generated-asset schema, linter, validator, or example change",
  "rule": "AI agents must not invent generated asset filenames, IDs, dimensions, atlas frames, pivots, or checksums; generation/build and manifest validation precede runtime integration.",
  "scope": "Generated-asset projects",
  "state": "requested",
  "status": "active",
  "title": "Generated outputs must become facts before integration",
  "validation_method": "Run manifest validator and inspect runtime asset references for manifest/catalog authority."
}
-->
### INV-002 — Generated outputs must become facts before integration

- **State:** `requested`
- **Authority:** Final handbook and user-approved architecture doctrine
- **Evidence:** Manifest validator, generated-asset examples, handbook Part III
- **Last Checked:** v2.0 release
- **Recheck Trigger:** Any generated-asset schema, linter, validator, or example change
- **Rule:** AI agents must not invent generated asset filenames, IDs, dimensions, atlas frames, pivots, or checksums; generation/build and manifest validation precede runtime integration.
- **Scope:** Generated-asset projects
- **Status:** active
- **Validation Method:** Run manifest validator and inspect runtime asset references for manifest/catalog authority.
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "authority": "Final handbook",
  "evidence": "Chapter 4 and agent operating contract",
  "id": "INV-003",
  "last_checked": "v2.0 release",
  "recheck_trigger": "Any agent-contract or existing-project-preservation change",
  "rule": "Existing functional renderers, frameworks, lifecycle systems, and asset pipelines are preserved unless the requested outcome requires migration and evidence supports it.",
  "scope": "Existing-project workflows",
  "state": "requested",
  "status": "active",
  "title": "No unsolicited engine rewrites",
  "validation_method": "Architecture-change review and ADR when migration is consequential."
}
-->
### INV-003 — No unsolicited engine rewrites

- **State:** `requested`
- **Authority:** Final handbook
- **Evidence:** Chapter 4 and agent operating contract
- **Last Checked:** v2.0 release
- **Recheck Trigger:** Any agent-contract or existing-project-preservation change
- **Rule:** Existing functional renderers, frameworks, lifecycle systems, and asset pipelines are preserved unless the requested outcome requires migration and evidence supports it.
- **Scope:** Existing-project workflows
- **Status:** active
- **Validation Method:** Architecture-change review and ADR when migration is consequential.
<!-- /operational-state:entry -->

## 5. Verified Working Behavior

Add stable `VER-###` entries only when evidence proves the required behavior through an appropriate path.

<!-- operational-state:entry
{
  "artifact_revision": "v2.0",
  "capability": "Core Python tooling and all ten example architecture contracts pass the toolkit self-test, including positive and negative linter/manifest fixtures.",
  "dependencies": [
    "Python 3.10+; Node syntax check only when Node is present"
  ],
  "evidence": "qa/toolkit-selftest.log ends PASS toolkit self-test",
  "freshness": "current",
  "id": "VER-001",
  "last_verified": "2026-08-18T18:45:00Z",
  "recheck_trigger": "Any tool, schema, template, or example-contract change",
  "scope": "tools and examples",
  "state": "verified",
  "title": "Toolkit self-test passes",
  "verification_method": "python tools/toolkit_selftest.py"
}
-->
### VER-001 — Toolkit self-test passes

- **State:** `verified`
- **Artifact Revision:** v2.0
- **Capability:** Core Python tooling and all ten example architecture contracts pass the toolkit self-test, including positive and negative linter/manifest fixtures.
- **Dependencies:** ["Python 3.10+; Node syntax check only when Node is present"]
- **Evidence:** qa/toolkit-selftest.log ends PASS toolkit self-test
- **Freshness:** current
- **Last Verified:** 2026-08-18T18:45:00Z
- **Recheck Trigger:** Any tool, schema, template, or example-contract change
- **Scope:** tools and examples
- **Verification Method:** python tools/toolkit_selftest.py
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "artifact_revision": "v2.0",
  "capability": "Final handbook is a visually inspected 42-page DOCX with linked static contents and no observed clipping, overlap, or broken tables.",
  "dependencies": [
    "LibreOffice/render_docx toolchain"
  ],
  "evidence": "qa/DOCX_QA.md and qa/docx_render4",
  "freshness": "current",
  "id": "VER-002",
  "last_verified": "2026-08-18T18:45:00Z",
  "recheck_trigger": "Any final Markdown, DOCX style, table, code-block, contents, header, or footer change",
  "scope": "final handbook DOCX",
  "state": "verified",
  "title": "Final DOCX renders cleanly",
  "verification_method": "Canonical DOCX render to PNGs plus complete page-set contact-sheet review and direct front-matter inspection"
}
-->
### VER-002 — Final DOCX renders cleanly

- **State:** `verified`
- **Artifact Revision:** v2.0
- **Capability:** Final handbook is a visually inspected 42-page DOCX with linked static contents and no observed clipping, overlap, or broken tables.
- **Dependencies:** ["LibreOffice/render_docx toolchain"]
- **Evidence:** qa/DOCX_QA.md and qa/docx_render4
- **Freshness:** current
- **Last Verified:** 2026-08-18T18:45:00Z
- **Recheck Trigger:** Any final Markdown, DOCX style, table, code-block, contents, header, or footer change
- **Scope:** final handbook DOCX
- **Verification Method:** Canonical DOCX render to PNGs plus complete page-set contact-sheet review and direct front-matter inspection
<!-- /operational-state:entry -->

<!-- operational-state:entry
{
  "artifact_revision": "v2.0",
  "capability": "Automated DOCX accessibility audit reports zero high, medium, or low issues.",
  "dependencies": [],
  "evidence": "qa/docx-a11y.json and qa/docx-a11y.txt",
  "freshness": "current",
  "id": "VER-003",
  "last_verified": "2026-08-18T18:45:00Z",
  "recheck_trigger": "Any DOCX content/layout generation change",
  "scope": "final handbook DOCX",
  "state": "verified",
  "title": "DOCX accessibility audit is clean",
  "verification_method": "docx a11y_audit.py"
}
-->
### VER-003 — DOCX accessibility audit is clean

- **State:** `verified`
- **Artifact Revision:** v2.0
- **Capability:** Automated DOCX accessibility audit reports zero high, medium, or low issues.
- **Dependencies:** []
- **Evidence:** qa/docx-a11y.json and qa/docx-a11y.txt
- **Freshness:** current
- **Last Verified:** 2026-08-18T18:45:00Z
- **Recheck Trigger:** Any DOCX content/layout generation change
- **Scope:** final handbook DOCX
- **Verification Method:** docx a11y_audit.py
<!-- /operational-state:entry -->

## 6. Known Not Working

Add stable `BRK-###` entries for confirmed failures. Keep them until repair evidence exists.

## 7. Implemented but Unverified

Add stable `UNV-###` entries for code, files, configuration, or artifact features that exist but are not proven through the required user journey.

<!-- operational-state:entry
{
  "artifact_revision": "v2.0",
  "capability": "browser_smoke.mjs is implemented and Node syntax-checked; missing Playwright produces an explicit SKIP status.",
  "evidence": "Node syntax check in toolkit self-test; Playwright absent in authoring environment",
  "id": "UNV-001",
  "missing_evidence": "Execution against a running target browser-game application with Playwright installed",
  "scope": "Optional browser runtime smoke",
  "state": "implemented-unverified",
  "status": "active",
  "title": "Optional browser smoke against a real target app",
  "validation_method": "Install Playwright in a target project, start the declared validation.browserUrl server, then run run_project_checks.py --browser."
}
-->
### UNV-001 — Optional browser smoke against a real target app

- **State:** `implemented-unverified`
- **Artifact Revision:** v2.0
- **Capability:** browser_smoke.mjs is implemented and Node syntax-checked; missing Playwright produces an explicit SKIP status.
- **Evidence:** Node syntax check in toolkit self-test; Playwright absent in authoring environment
- **Missing Evidence:** Execution against a running target browser-game application with Playwright installed
- **Scope:** Optional browser runtime smoke
- **Status:** active
- **Validation Method:** Install Playwright in a target project, start the declared validation.browserUrl server, then run run_project_checks.py --browser.
<!-- /operational-state:entry -->

## 8. Unknown or Evidence-Stale State

Add stable `UNK-###` entries for missing, conflicting, inaccessible, stale, or invalidated evidence.

## 9. Pending Work

Add stable `PND-###` entries for intentionally incomplete work. Pending does not automatically mean failed.

## 10. Active Decisions, Defaults, and Prohibitions

Add stable `DEC-###` entries for source locks, routes, naming, packaging, style, rejected approaches, environment limits, and explicit supersessions.

<!-- operational-state:entry
{
  "authority": "v2.0 design decision",
  "evidence": "schemas/architecture-project.schema.json and tools",
  "id": "DEC-001",
  "rule": "architecture.project.json declares active capabilities; preflight, lint, checklist, manifest validation, and orchestration derive project obligations from it.",
  "scope": "Toolkit operation",
  "state": "current-baseline",
  "status": "active",
  "title": "Project contract is the operational activation layer"
}
-->
### DEC-001 — Project contract is the operational activation layer

- **State:** `current-baseline`
- **Authority:** v2.0 design decision
- **Evidence:** schemas/architecture-project.schema.json and tools
- **Rule:** architecture.project.json declares active capabilities; preflight, lint, checklist, manifest validation, and orchestration derive project obligations from it.
- **Scope:** Toolkit operation
- **Status:** active
<!-- /operational-state:entry -->

## 11. Validation and Evidence Matrix

| ID | Claim or behavior | State | Evidence | Validation method | Artifact/revision | Last checked | Recheck trigger |
|---|---|---|---|---|---|---|---|

## 12. Current Change Scope and Impact Radius

- **Allowed to change:** Not yet declared.
- **Must remain unchanged:** Existing verified behavior outside the impact radius.
- **Potentially affected behavior:** Unknown until the next task is scoped.
- **Mandatory checks:** None yet selected.
- **Checks deliberately reused:** None yet selected.
- **Repair class:** Undeclared.

## 13. Compact Revision Log

### Revision 1 — 2026-08-18T18:22:31Z

- **Artifact/source identity:** `Not yet established`
- **State deltas:** Initialized operational state.
- **New evidence:** None.
- **Validation not performed:** All behavioral validation remains pending unless explicitly recorded above.

### Revision 2 — 2026-08-18T18:47:32Z

- **Artifact/source identity:** Modern 2D Browser Game Architecture Toolkit v2.0
- **State deltas:** Updated metadata: current_baseline; Added INV-001 to 4. Active Invariants; Added INV-002 to 4. Active Invariants; Added INV-003 to 4. Active Invariants; Added VER-001 to 5. Verified Working Behavior; Added VER-002 to 5. Verified Working Behavior; Added VER-003 to 5. Verified Working Behavior; Added UNV-001 to 7. Implemented but Unverified; Added DEC-001 to 10. Active Decisions, Defaults, and Prohibitions
- **New evidence:** toolkit_selftest.py PASS for all 10 example contracts; architecture linter negative fixture detects SEC003 and WEBGL101; manifest validator negative fixture detects MAN024; DOCX canonical render produced 42 pages and complete visual inspection passed; DOCX accessibility audit high=0 medium=0 low=0; optional Playwright dependency is absent in authoring environment and browser smoke records SKIP rather than false PASS
- **Newly verified behavior:** VER-001; VER-002; VER-003
- **Newly known failure:** None.
- **Superseded rule:** None.
- **Validation not performed:** browser_smoke.mjs against a real target game because no target app/server is part of this toolkit release and Playwright is not installed
- **Reason for broad revalidation:** Initial release baseline establishment
- **Summary:** Establish v2.0 final handbook and operational toolkit as the current verified release baseline

