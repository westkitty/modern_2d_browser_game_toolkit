# Swarm Collision Broadphase Lab

A measurement bench, not a game level. The same agents can be tested with naive pair enumeration or a uniform grid.

## Why this architecture

Spatial hashing is an optimization. It can lose when everyone occupies a few cells. Clustered layout exists to show that; there is no claim of universal O(N) behavior.

## Controls

- Entity count
- Naive vs grid
- Uniform vs clustered
- Pause / reset

HUD: entity count, candidate pairs, narrowphase tests, update time, frame time.
