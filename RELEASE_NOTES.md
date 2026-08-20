# Release Notes — Version 2.0

**Release:** Modern 2D Browser Game Architecture Toolkit  
**Date:** 2026-08-18

## Purpose

Turn the architecture handbook into an operational project governor: humans and AI coding agents can declare a project's actual architecture, compile only relevant obligations, lint recurring high-confidence mistakes, validate generated asset facts, create project-specific verification checklists, and retain meaningful architecture decisions.

## Primary deliverables

- Final DOCX handbook with linked static contents and 42-page visually inspected render.
- Editable Markdown handbook source.
- PDF convenience render.
- Contract-driven architecture linter.
- Architecture preflight/activation compiler.
- Asset-manifest validator.
- Project-specific checklist generator.
- One-command project-check orchestrator.
- Optional Playwright browser smoke harness.
- Bootstrapper, JSON schemas, ADR/agent/validation templates, and CI starter.
- Exactly ten example architecture contracts/build recipes.
- Toolkit self-test with clean and intentionally failing fixtures.

## Validation performed

- `python tools/toolkit_selftest.py` — PASS for all ten example contracts.
- Python tool compilation — PASS through self-test.
- `browser_smoke.mjs` Node syntax check — PASS where Node is available.
- Orchestrator spot tests — PASS on generated-asset and SharedArrayBuffer example contracts; generated-art recipe correctly produces an AudioContext implementation warning because the recipe is architecture-only, not a completed game.
- DOCX canonical render — PASS, 42 pages.
- DOCX visual page inspection — PASS.
- DOCX accessibility audit — high=0, medium=0, low=0.
- Static contents internal anchors/bookmarks — present.
- Current platform/API source review — recorded in `qa/SOURCE_VERIFICATION.md`.

## Known limitations

- Static lint is intentionally heuristic and cannot prove gameplay, accessibility, performance, visual quality, or cleanup behavior.
- Browser smoke requires a running test server plus Playwright; absence of Playwright is a SKIP, not a pass.
- Example directories are architecture recipes/contracts, not ten complete game implementations. They show how to use the toolkit to build the named projects.
- Project-native validation commands are not executed unless the user explicitly passes `--execute-project-commands`.

## Compatibility

Core Python tooling requires Python 3.10+ and otherwise uses the standard library. Node/Playwright are optional for browser smoke.
