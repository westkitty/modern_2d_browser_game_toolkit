# Offline Strategy Simulation

Turn-based map with IndexedDB persistence and a worker for non-trivial turn resolution.

## Why this architecture
The UI is a turn sheet. Heavy deterministic calculation belongs off the main thread. Saves are versioned documents.

## Status
Placeholder route for the showcase launcher. Playable implementation lands in a later commit.
