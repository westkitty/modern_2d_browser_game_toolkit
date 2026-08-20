# Offline Strategy Simulation

A 5×5 territory map. End Turn hands a deliberately heavy deterministic step to a worker. Saves use IndexedDB with `schemaVersion`.

## Why this architecture

The UI is a turn sheet. The expensive part is world resolution, so a worker is justified. Saves are structured documents, so IndexedDB is justified over a few localStorage keys.

## Persistence

- Current schema is version 2.
- `Load v1 fixture` migrates an older shape.
- `Load corrupt fixture` is rejected without crashing.
- Quota/transaction failure reports as a failed save; success is never claimed.
