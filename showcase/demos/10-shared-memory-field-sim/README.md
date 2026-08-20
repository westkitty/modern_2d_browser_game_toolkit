# Shared-Memory Field Simulator

A 64×64 field updated on a worker. SharedArrayBuffer is used only when `crossOriginIsolated` is true; otherwise the worker posts a copy.

## Why this architecture

Shared memory is a security-gated concurrency tool. The demo detects isolation, refuses SAB when the headers are absent, and keeps a fallback so the lesson still works.

Serve through `python3 tools/serve_showcase.py` so COOP/COEP/CORP are present.

The HUD labels the active path as `SHARED MEMORY` or `FALLBACK TRANSFER/COPY`.
