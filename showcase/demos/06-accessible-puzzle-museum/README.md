# Accessible Puzzle Museum

Three DOM exhibits with no canvas and no animation loop.

## Why this architecture

The puzzles are discrete logic problems with instructions and results. Semantic HTML already models rooms, buttons, and status. A continuous loop would fight keyboard and screen-reader use.

## Exhibits

1. Chime order: Low, High, Mid.
2. Vault digits: 4-1-9.
3. Relic lineup: Bone, Coin, Lens.

Room changes move focus to the exhibit heading. Completion is stored in `localStorage` with `schemaVersion: 1`. Reset clears that device state.
