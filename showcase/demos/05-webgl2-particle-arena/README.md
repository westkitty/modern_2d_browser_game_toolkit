# WebGL2 Particle Arena

A GPU-drawn particle field. One instanced `drawArraysInstanced` call renders thousands of quads. Canvas 2D would not demonstrate the architecture being tested.

## Why this architecture

The visual load is the particle count. Instancing exists because individual draws would be the wrong API. This is not a general-purpose engine.

## Behavior

- Move the pointer; press to pull harder.
- High quality: 24,000 particles. Reduced effects: 4,000.
- Shader compile/link failures are shown in the page.
- `webglcontextlost` stops drawing; restoration rebuilds programs and buffers.
- If WebGL2 is missing, the page says so instead of showing a blank canvas.

No FPS guarantee is claimed. The HUD reports a smoothed frame-time sample only.
