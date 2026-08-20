# High-DPI Canvas Arcade Dodger

A small real-time dodging game on a Canvas 2D surface with a device-pixel-ratio backing store.

## Why this architecture

Hazards move continuously and collision is spatial, so a pixel surface is justified. Variable-delta integration is enough for arcade feel if pathological frame gaps are clamped. A fixed timestep is not required for this ruleset.

## Behavior

- WASD / arrow keys move the player.
- Stones spawn from the edges; contact ends the round.
- Score is survival time.
- Resize remaps the backing store; world coordinates stay 640×360.
- `blur` and `visibilitychange` clear held keys and reset the frame clock so resume cannot teleport.
- Web Audio beeps unlock from Start/Mute; mute is a visible control.

Maximum integrated delta is 1/20s.
