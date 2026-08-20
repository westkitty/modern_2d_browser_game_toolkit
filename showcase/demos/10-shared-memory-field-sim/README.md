# Shared-Memory Field Simulator

Worker field simulation that uses SharedArrayBuffer only when cross-origin isolation is active, otherwise a copy/transfer fallback.

## Why this architecture
Shared memory is a security-gated capability. The demo must detect isolation and remain informative without it.

## Status
Placeholder route for the showcase launcher. Playable implementation lands in a later commit.
