# Fixed-Step Platformer

One-screen platformer with a bounded fixed simulation step and interpolated presentation.

## Why this architecture
Jump arcs and AABB collision change if physics follows the display refresh. Interpolation is presentation only and is not claimed as determinism.

## Status
Placeholder route for the showcase launcher. Playable implementation lands in a later commit.
