# Fixed-Step Platformer

A one-screen platformer whose collision runs on a bounded 60 Hz step while the canvas interpolates previous and current poses.

## Why this architecture

Jump arcs and AABB rests change if physics follows the display refresh. A fixed step with a capped accumulator keeps gameplay stable. Interpolation is presentation only and is not claimed as cross-platform determinism.

## Behavior

- Move and jump from keyboard; Gamepad API stick + face button when a pad is present.
- Four colliders: ground plus three platforms. The brass door is the goal.
- Reset snaps interpolation history (`prev = current`) so the sprite does not smear.
- Accumulator is clamped to five simulation steps to prevent runaway catch-up.
- Missing gamepads are ignored.

Radial deadzone fixtures: `node deadzone.test.mjs`.
