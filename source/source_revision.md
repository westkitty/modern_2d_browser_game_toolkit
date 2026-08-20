# MODERN 2D BROWSER GAME ARCHITECTURE

**Engineering Specification & Implementation Guide for AI-Assisted Development**

## CHAPTER 1 — PURPOSE, SCOPE, AND GOVERNING PRINCIPLES

This specification provides a modular, evidence-based architectural framework for 2D browser games developed with AI coding agents.

**The Governing Principle:**

*The game’s requirements determine the architecture. Begin with the simplest implementation that satisfies the required behavior, visual quality, performance, and accessibility targets. Introduce specialized rendering, physics, memory management, or infrastructure systems only when requirements, profiling, scale, or failure modes justify them.*

**Normative Terminology:**

- **REQUIRED:** A true invariant for the stated scope.
- **RECOMMENDED:** A strong default with legitimate exceptions.
- **CONDITIONAL:** Activated only when an identified requirement or observed condition exists.
- **OPTIONAL:** A capability that may be useful but is not needed for correctness.
- **EXAMPLE:** Illustrative only. Never normative.
- **MEASURE:** A decision requiring profiling, observation, or benchmark evidence.
- **AVOID:** Generally harmful, but not logically impossible.
- **FORBIDDEN:** Unacceptable behavior (e.g., fabricated generated assets, exposed secrets).

## CHAPTER 2 — ARCHITECTURE DECISION FRAMEWORK

Architecture must not be chosen by buzzword. Use the following sequential evaluation:

1. **Requirement Intake:** What is the visual fidelity? Target device? Interaction model?
2. **Existing State:** Does a functional architecture already exist in the repository?
3. **Renderer Selection:** DOM vs. Canvas 2D vs. WebGL2.
4. **Timing Selection:** Event-driven vs. Variable-Delta vs. Fixed-Timestep.
5. **Asset Escalation:** Authored assets vs. Verified Generative Pipeline.
6. **Physics Escalation:** Point/AABB vs. Spatial Broadphase vs. Rigid Body.

## CHAPTER 3 — EXISTING-PROJECT PRESERVATION

When an AI agent enters an existing repository, the following rule is **REQUIRED**:

**NO UNSOLICITED ENGINE REWRITE.**

Before proposing architectural changes, inspect:

- The current renderer (e.g., Phaser, PixiJS, Three.js, vanilla Canvas).
- The scene lifecycle and state ownership.
- Existing asset loading pipelines.
- Existing test coverage.

**FORBIDDEN:** Replacing an existing, functional game framework with a custom implementation unless explicitly required by a user prompt addressing a proven limitation.

## CHAPTER 4 — REFERENCE ARCHITECTURE PROFILES

The following profiles represent non-normative starting points.

- **Profile A — DOM/Interaction-Heavy:** Uses React/Vue or vanilla DOM. Event-driven timing. No canvas. Used for card games, text adventures.
- **Profile B — Minimal Canvas:** Canvas 2D rendering. Variable-delta update loop. Authored assets. Used for simple arcade/puzzle games.
- **Profile C — Deterministic 2D Action:** Canvas 2D or WebGL. Fixed-timestep simulation for physics stability. Render interpolation.
- **Profile D — Asset-Heavy Sprite Game:** Requires the Three-Stage Verified Asset Lifecycle. Manifest-driven loading. Texture atlases.
- **Profile E — Advanced GPU/WebGL2:** WebGL2 renderer. Instanced drawing. Custom GLSL shaders. Triggered strictly by draw-call pressure or visual FX requirements (bloom, normal mapping).

## CHAPTER 5 — BROWSER EXECUTION AND LIFECYCLE

Browser games exist within a hostile, unpredictable host environment.

- **`requestAnimationFrame`** **(rAF):** Pauses when the tab is hidden. Simulators MUST handle massive deltas upon tab resume.
- **Visibility API:** **RECOMMENDED** to pause audio and simulation when `document.hidden` is true.
- **Resize Events:** Viewports must cleanly handle `resize` events without stretching the aspect ratio or breaking DPI mapping.
- **Context Loss:** WebGL rendering paths are **REQUIRED** to handle `webglcontextlost` and `webglcontextrestored`.

## CHAPTER 6 — TIME, CLOCKS, AND SIMULATION MODELS

Distinguish between:

- **Wall Clock:** Real-world time.
- **Frame Timestamp:** The DOMHighResTimeStamp passed by rAF.
- **Simulation Time:** The internal time of the game world, which may be scaled, paused, or fixed.
- **Accumulated Time:** Unprocessed real time waiting to be simulated.

## CHAPTER 7 — VARIABLE-DELTA LOOP

**CONDITIONAL:** Use when physics determinism is not required, movement is simple, or the game is UI-heavy.

- **Limitations:** Physics integration varies with frame rate. Unsuitable for precise collision response.

```
// EXAMPLE: Variable-Delta Loop
class VariableLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn; this.renderFn = renderFn;
    this.lastTime = 0; this.rafId = null;
  }
  start() { this.lastTime = performance.now(); this.loop(this.lastTime); }
  loop(time) {
    let dt = (time - this.lastTime) / 1000.0;
    this.lastTime = time;
    if (dt > 0.1) dt = 0.1; // Spiral-of-death protection
    this.updateFn(dt);
    this.renderFn();
    this.rafId = requestAnimationFrame(t => this.loop(t));
  }
}


```

## CHAPTER 8 — FIXED-TIMESTEP LOOP

**CONDITIONAL:** Use when gameplay correctness depends on stable collision integration, network state sharing, or reproducible physics.

- *Note:* Fixed timestep improves stability but does not automatically guarantee full cross-device determinism (which relies on floating-point handling, input ordering, etc.).

```
// EXAMPLE: Fixed-Timestep (No Interpolation)
class FixedLoop {
  constructor(updateFn, renderFn, fps = 60) {
    this.updateFn = updateFn; this.renderFn = renderFn;
    this.step = 1 / fps; this.accumulator = 0; this.lastTime = 0;
  }
  loop(time) {
    let frameTime = (time - this.lastTime) / 1000.0;
    this.lastTime = time;
    if (frameTime > 0.25) frameTime = 0.25; // Cap massive spikes
    this.accumulator += frameTime;
    
    let simulatedSteps = 0;
    // Simulate authoritative logic
    while (this.accumulator >= this.step && simulatedSteps < 10) {
      this.updateFn(this.step);
      this.accumulator -= this.step;
      simulatedSteps++;
    }
    this.renderFn();
    requestAnimationFrame(t => this.loop(t));
  }
}


```

## CHAPTER 9 — FIXED TIMESTEP + INTERPOLATED RENDERING

**CONDITIONAL:** Use when fixed simulation rates (e.g., 60Hz physics) clash with display refresh rates (e.g., 144Hz monitors), causing visual stutter.

- **Rule:** Authoritative simulation state must retain both `previous` and `current` values for interpolatable fields (position, rotation).

```
// EXAMPLE: Fixed-Timestep + Render Interpolation
updateEntity(entity, dt) {
  entity.prevX = entity.x; // Record previous authoritative state
  entity.x += entity.velocity * dt; // Calculate new authoritative state
}

// In loop(), pass alpha to renderFn
const alpha = this.accumulator / this.step;
this.renderFn(alpha);

// In Render function:
renderEntity(ctx, entity, alpha) {
  // Derive render state. DO NOT mutate entity.x.
  const renderX = entity.prevX + (entity.x - entity.prevX) * alpha;
  ctx.drawImage(img, renderX, entity.y); 
}


```

## CHAPTER 10 — HIGH-DPI AND VIEWPORT ARCHITECTURE

**CONDITIONAL:** REQUIRED if Canvas 2D or WebGL is used.

- **CSS Pixels:** Logical DOM size.
- **Device Pixels:** Physical screen pixels.
- **Backing Store:** The actual resolution of the canvas bitmap.

```
// EXAMPLE: High-DPI Viewport Initialization
function initHighDPICanvas(canvas, logicalWidth, logicalHeight) {
  const ctx = canvas.getContext('2d');
  // Optional DPR cap to save fill-rate on ultra-res devices
  const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
  
  // Calculate aspect-preserving fit based on window size vs logical size
  const scale = Math.min(window.innerWidth / logicalWidth, window.innerHeight / logicalHeight);
  const cssWidth = logicalWidth * scale;
  const cssHeight = logicalHeight * scale;

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  // Scale backing store by DPR
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  // Scale context to map drawing calls to the logical space
  ctx.scale(dpr * scale, dpr * scale);
  
  return { ctx, dpr, scale };
}


```

## CHAPTER 11 — STATE OWNERSHIP

**REQUIRED:** Clean state separation.

- **Authoritative Simulation State:** Hitboxes, velocities, logical positions. Updated ONLY by simulation logic.
- **Derived Render State:** Interpolated coordinates.
- **Transient Presentation State:** Screen shake offsets, hit flashes, particle lifetimes. Updated in render logic.

## CHAPTER 12 — SCENE AND SYSTEM LIFECYCLE

**RECOMMENDED:** Encapsulate game phases (Menu, Gameplay, Game Over) as discrete Scenes.

- **Initialize:** One-time allocation.
- **Enter:** Hook events, reset state.
- **Update / Render:** Active frame logic.
- **Exit / Dispose:** Clean up event listeners, clear caches. Memory leaks frequently occur when `Exit` fails to unbind input listeners.

## CHAPTER 13 — INPUT ARCHITECTURE

**CONDITIONAL:** Map raw inputs to logical actions when multiple input methods (Keyboard + Gamepad) are required.

- `Raw:` Spacebar pressed.
- `Logical:` Action "JUMP" triggered.
- **Edge-Triggered:** Fire once per press (e.g., jump).
- **Continuous:** Evaluate every frame (e.g., move left).

## CHAPTER 14 — ANALOG INPUT AND DEADZONES

**CONDITIONAL:** REQUIRED when parsing analog gamepad thumbsticks.

**Problem:** Naive axial deadzones (`if abs(x) < 0.1 then 0`) create square deadzones, restricting diagonal motion.

**Solution:** Scaled Radial Deadzone normalization.

```
// EXAMPLE: Radial Deadzone Normalization
function applyRadialDeadzone(x, y, deadzone = 0.2) {
  const mag = Math.sqrt(x * x + y * y);
  if (mag < deadzone) return { x: 0, y: 0 };
  
  // Normalize direction, then scale magnitude from 0.0 to 1.0 starting AT the deadzone
  const normalizedMag = Math.min(1.0, (mag - deadzone) / (1.0 - deadzone));
  return {
    x: (x / mag) * normalizedMag,
    y: (y / mag) * normalizedMag
  };
}


```

## CHAPTER 15 — ASSET SOURCE-OF-TRUTH MODEL

- **Source Asset:** Authored art (PSD, individual PNG).
- **Derived Build Output:** Texture packer atlas (WebP).
- **Manifest:** JSON file defining exact UV coordinates.
- **Runtime Asset:** Memory representation (Image object, WebGLTexture).

## CHAPTER 16 — THREE-STAGE VERIFIED ASSET LIFECYCLE

**REQUIRED:** For AI-generated asset pipelines. An AI agent MUST NEVER invent filenames, dimensions, or atlas coordinates.

1. **Specification:** Agent defines requirements (`assets_needed.json`).
2. **Generation/Build:** Tooling fulfills the requirement and generates a concrete `manifest.json`.
3. **Verified Integration:** Agent writes game code relying *only* on the keys present in `manifest.json`.

## CHAPTER 17 — ASSET MANIFEST DESIGN

**EXAMPLE:** Valid JSON Manifest structure.

```
{
  "version": "1.0",
  "atlas": "assets/sprites.webp",
  "frames": {
    "player_idle": { "x": 0, "y": 0, "w": 64, "h": 64, "pivotX": 0.5, "pivotY": 1.0 },
    "enemy_drone": { "x": 64, "y": 0, "w": 32, "h": 32, "pivotX": 0.5, "pivotY": 0.5 }
  }
}


```

*Agents must parse this file to write* *`ctx.drawImage`* *logic. They must not guess that player\_idle is at 0,0.*

## CHAPTER 18 — IMAGE / SPRITE PIPELINE

- **Authored Sprite Sheets:** Standard and acceptable.
- **Generated Animation Grids:** **AVOID.** AI generative models cannot reliably maintain mathematical pixel-grids for frame-by-frame animation. Use single isolated static assets (parts) instead of asking for "an 8-frame walk cycle."
- **Alpha:** Prefer native RGBA generation. Destructive luma-key matting (removing white backgrounds) causes edge-fringing and should be used only as a last resort.

## CHAPTER 19 — RENDER PATH SELECTION

- **DOM/CSS:** Best for semantic interfaces, turn-based games, accessibility.
- **Canvas 2D:** Best for standard 2D games, procedural drawing, simple masking.
- **WebGL2:** **CONDITIONAL.** Triggered ONLY by draw-call pressure (thousands of dynamic sprites), requirement for custom shaders, or GPU particles.
- **Existing Framework (Phaser/Pixi):** If present, retain it.

## CHAPTER 20 — CANVAS 2D ENGINEERING

- **Transforms:** Use `ctx.translate/rotate/scale` surrounded by `ctx.save()` and `ctx.restore()`.
- **Image Smoothing:** Set `ctx.imageSmoothingEnabled = false` for pixel art, `true` for high-res generated assets.
- **Batching:** Canvas 2D does not batch sprites natively. Heavy DOM-to-Canvas state changes (changing stroke color, fonts) mid-loop kill performance. Group similar draw calls.

## CHAPTER 21 — WEBGL2 ESCALATION

**CONDITIONAL:** When Canvas 2D frame budgets are exceeded.

- **Validation:** Use `canvas.getContext('webgl2')`.
- **APIs:** Use standard WebGL2. Do NOT use `glDrawElementsInstancedWithBaseVertex` (desktop OpenGL). Use `gl.drawElementsInstanced`.
- **Context Loss:** Must listen to `webglcontextlost` to halt rendering and `webglcontextrestored` to reload textures/shaders.

## CHAPTER 22 — INSTANCING, BATCHING, AND ATLASES

**CONDITIONAL:** When WebGL2 is activated.

- **Draw-Call Pressure:** The CPU overhead of calling `gl.drawArrays` thousands of times per frame is high.
- **Solution:** Use texture atlases so no texture-bind changes occur, and use `gl.vertexAttribDivisor` combined with instanced rendering to draw thousands of sprites in one API call.

## CHAPTER 23 — LIGHTING AND NORMAL MAPS

**OPTIONAL:** Advanced WebGL rendering capability.

- **Luminance-to-Normal Approximations:** If generating normal maps algorithmically (e.g., Sobel filters) from 2D diffuse color, acknowledge the physical limitations: painted highlights, drop shadows, and dark outlines will generate false geometric depth. It is an aesthetic approximation, not true 3D recovery.

## CHAPTER 24 — POSTPROCESSING

**OPTIONAL:**

- **Framebuffer Cost:** Rendering to an offscreen FBO and back to the screen consumes fill rate.
- **Accessibility:** Provide options to disable bloom, chromatic aberration, or screen-shake for photosensitivity and reduced-motion requirements.

## CHAPTER 25 — ANIMATION DECISION FRAMEWORK

- **Frame Animation:** Best for authored pixel art.
- **Scene Graphs (Transforms):** Best for modular, generated assets (e.g., rotating an arm around a shoulder pivot).
- **Tweens:** Best for UI sliding, weapon recoil.
- **Procedural (IK):** **OPTIONAL.** Use only when programmatic foot-placement on uneven terrain is required.

## CHAPTER 26 — CAMERA AND PRESENTATION

**REQUIRED:** Clean separation of camera state.

- **Smoothing:** Use frame-rate independent exponential decay, NOT naive lerping.

```
// EXAMPLE: Frame-rate Independent Camera Smoothing
function updateCamera(cam, targetX, targetY, dt, speed = 5.0) {
  // 1.0 - Math.exp(-speed * dt) guarantees consistent decay regardless of delta time.
  const t = 1.0 - Math.exp(-speed * dt);
  cam.x += (targetX - cam.x) * t;
  cam.y += (targetY - cam.y) * t;
}


```

- **Screen Shake:** Render-only. Generate using layered trigonometric oscillation, not true Perlin noise unless a noise library is actively required. Do NOT mutate `cam.x`. Mutate `ctx.translate(shakeX, shakeY)` during render.

## CHAPTER 27 — COLLISION ESCALATION

**MEASURE:** Escalate collision architecture based on pair count and candidate density.

1. **Point / Circle:** Fastest, distance squared.
2. **AABB:** Axis-Aligned Bounding Box. Standard for platformers.
3. **Spatial Broadphase:** See Chapter 28.
4. **SAT/Polygon Narrowphase:** Only if complex rotated shapes require precise rejection.

## CHAPTER 28 — SPATIAL PARTITIONING

**CONDITIONAL:** Triggered when $O(N^2)$ checks for entities (e.g., particles vs enemies) break the frame budget.

- **Complexity Reality:** Spatial hashing does NOT guarantee $O(N)$ performance. Performance depends heavily on uniform object distribution, bucket sizing, and duplicate candidate suppression (objects spanning multiple cells). Do not mandate a broadphase for N < 200 without profiling.

## CHAPTER 29 — MEMORY AND ALLOCATION

**REQUIRED:** JavaScript GC pauses cause frame drops. Do not claim "Zero-GC"; claim "Hot-Path Allocation Awareness."

- **Problem:** Micro-allocations inside tight loops (e.g., `return new Vector2()`).
- **Intervention:** Pass reusable output objects (`outVector`) or use Object Pools for high-churn entities like bullets/particles. Use TypedArrays (`Float32Array`) for WebGL buffers.
- **Tradeoff:** Do not sacrifice readability for pooling unless profiling proves GC pressure is causing missed frames.

## CHAPTER 30 — PERFORMANCE ENGINEERING

**MEASURE:** Frame Budgets.

- At 60 FPS, you have \~16.6ms total.
- Evaluate DOM layout recalculations, Canvas draw calls, Javascript logic, and GC pauses.
- Sample numbers (e.g., 10,000 sprites) are architectural EXAMPLES, not hard limits.

## CHAPTER 31 — PROFILING AND BENCHMARKING

**REQUIRED METHODOLOGY:**

1. Collect baseline trace in DevTools.
2. Identify specific bottleneck (e.g., `drawImage` taking 8ms).
3. Implement targeted intervention (e.g., Sprite Batching).
4. Measure again. Revert if no proven win.

## CHAPTER 32 — WORKERS AND OFF-MAIN-THREAD ESCALATION

**CONDITIONAL:** Use Web Workers only when complex deterministic physics, pathfinding, or terrain generation stalls the main thread.

- **Overhead:** Structured cloning of data across worker boundaries has a serialization cost. Use `SharedArrayBuffer` or Transferable objects. `OffscreenCanvas` is highly conditionally based on browser support.

## CHAPTER 33 — RESOURCE OWNERSHIP AND DISPOSAL

**REQUIRED:** Define who creates and who cleans up resources.

- **Events:** `window.addEventListener` inside a Scene MUST be removed via `window.removeEventListener` on Scene exit.
- **WebGL:** `gl.deleteTexture()`, `gl.deleteBuffer()`, `gl.deleteProgram()` MUST be called when assets or contexts are unloaded.
- **Audio:** Disconnect unused `AudioNode` structures.

## CHAPTER 34 — WEB AUDIO ARCHITECTURE

- **Browser Restrictions:** `AudioContext` initializes in a suspended state. It MUST be resumed via user gesture (e.g., `pointerdown`, `keydown`).
- **Buses:** Route nodes: `Source` -> `SFX_GainNode` -> `Master_GainNode` -> `Destination`.
- **Allocation:** Web Audio nodes (`createBufferSource`) are inherently allocated and GC'd by the browser engine upon playback completion.

## CHAPTER 35 — LOADING AND RECOVERY

**REQUIRED:** Handle failure gracefully.

- If `manifest.json` 404s, fail explicitly with a visible console/UI error. Do not swallow the error and render invisible entities.
- If WebGL creation fails, fallback to Canvas 2D or display an unsupported message.

## CHAPTER 36 — PERSISTENCE AND SCHEMA VERSIONING

**CONDITIONAL:** When saves/settings are required.

- Use `localStorage` for small configs, `IndexedDB` for massive worlds.
- **Versioning:** Always store a `schemaVersion` key. When loading, run migration functions if the saved version is older than the active game version. Handle corrupted/malformed JSON safely.

## CHAPTER 37 — ACCESSIBILITY AND INPUT INCLUSION

**RECOMMENDED:**

- Allow rebinding of all controls.
- Provide a semantic DOM fallback (HTML buttons overlaying the canvas) for core menus to support screen readers.
- Implement a "Reduced Motion" setting that disables camera shake and bloom.

## CHAPTER 38 — SECURITY AND DEPLOYMENT BOUNDARIES

**CONDITIONAL:** Deployment infrastructure is strictly optional.

**FORBIDDEN:**

- Embedding secrets, API keys, or JWTs in frontend source code.
- Passing tokens in URLs or query strings.
- Using privileged `setuid` helpers for arbitrary client execution.

**Safe Flow:**

1. Build local.
2. CLI requests a short-lived Signed GCS PUT URL from an authenticated backend (using least-privilege IAM).
3. CLI streams output to Cloud Storage.

## CHAPTER 39 — TESTING STRATEGY

- **Static:** TypeScript / ESLint.
- **Unit:** Math (deadzones, interpolation).
- **Integration:** Asset loading sequences.
- **Visual/QA:** Confirming camera interpolation feels correct. Tests must prove behavior, not simply test that a variable was assigned.

## CHAPTER 40 — CONDITIONAL VERIFICATION MATRIX

Projects should be validated based *only* on enabled subsystems:

- **[UNIVERSAL]** Are presentation and simulation state cleanly separated?
- **[CANVAS]** Is the logical space correctly scaled by DPR?
- **[FIXED TIMESTEP]** Does the accumulator prevent a spiral-of-death?
- **[WEB AUDIO]** Is `AudioContext` resumed via user interaction?
- **[GENERATED ASSETS]** Does the code reference verified manifest keys rather than hardcoded assumptions?

## CHAPTER 41 — ARCHITECTURE DECISION RECORDS (ADR)

When escalating architecture, document it:

- **Problem:** Main thread stalls during collision.
- **Evidence:** Devtools shows 12ms spent in `narrowphase()`.
- **Decision:** Implemented Spatial Hash Broadphase.
- **Validation:** Broadphase reduced collision check to 2ms.

## CHAPTER 42 — CAPABILITY ESCALATION CATALOG

- **Action Mapping:** Solves hardcoded input. Evidence: Needed gamepad support.
- **Object Pooling:** Solves GC stutters. Evidence: Memory timeline shows sawtooth churn during bullet fire.
- **WebGL2:** Solves draw-call bottlenecks. Evidence: Canvas `drawImage` exceeding 10ms frame budget.

## CHAPTER 43 — ANTI-PATTERN CATALOG

- **Architecture by Buzzword:** Implementing a quadtree when a simple array filter would cost 0.1ms.
- **Invented Generated Assets:** Agent hallucinates `hero_walk_01.png` instead of reading the asset manifest.
- **Render-time Mutation:** Updating `player.hp` inside `render()`.
- **Hidden Listeners:** Memory leaks caused by failing to `removeEventListener` on scene swap.

## CHAPTER 44 — AI CODING AGENT OPERATING CONTRACT

**SYSTEM INSTRUCTION/SKILL FOR AGENTS:**

1. **Inspect First:** Determine current architecture, framework, and rendering context.
2. **No Unsolicited Rewrites:** Preserve working code. Do not replace PixiJS with raw Canvas unless required.
3. **Fact-based Assets:** Read from generated manifests. Never invent asset URLs or UVs.
4. **State Separation:** Ensure presentation functions do not mutate authoritative simulation state.
5. **Measure Before Optimization:** Do not pool objects or write spatial hashes unless profiling data or scale requirements exist.
6. **Handle Errors:** Surface loading and context failures; do not swallow them.
7. **Choose Timing Deliberately:** Use variable-delta for simple UI/Arcade; fixed-timestep when determinism is required.

## CHAPTER 45 — INTEGRATED REFERENCE IMPLEMENTATIONS

### REFERENCE A: Variable-Delta Canvas Foundation

*Intentionally does NOT implement fixed physics or asset manifests.*

```
class MinimalGame {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
    this.lastTime = performance.now();
    this.x = 0;
  }
  loop(time) {
    let dt = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;
    
    this.x += 100 * dt; // Simple variable-delta movement
    
    this.ctx.clearRect(0, 0, 800, 600);
    this.ctx.fillRect(this.x, 300, 50, 50);
    requestAnimationFrame(t => this.loop(t));
  }
}


```

### REFERENCE B: Fixed-Timestep with Interpolation

*Intentionally does NOT implement WebGL or complex graphics.*

```
class PhysicsGame {
  constructor() {
    this.step = 1/60; this.accumulator = 0; this.lastTime = 0;
    this.entity = { x: 0, prevX: 0, v: 100 };
  }
  start(time) { this.lastTime = time; requestAnimationFrame(t => this.loop(t)); }
  loop(time) {
    let dt = Math.min((time - this.lastTime) / 1000, 0.25);
    this.lastTime = time;
    this.accumulator += dt;
    
    while(this.accumulator >= this.step) {
      this.entity.prevX = this.entity.x; // Save previous authoritative state
      this.entity.x += this.entity.v * this.step; // Integrate authoritative state
      this.accumulator -= this.step;
    }
    
    const alpha = this.accumulator / this.step;
    const renderX = this.entity.prevX + (this.entity.x - this.entity.prevX) * alpha;
    // render renderX to screen...
    
    requestAnimationFrame(t => this.loop(t));
  }
}


```

### REFERENCE C: Verified Asset Loading

*Intentionally does NOT implement gameplay logic.*

```
async function loadVerifiedAssets(manifestUrl) {
  const response = await fetch(manifestUrl);
  if (!response.ok) throw new Error(`Manifest load failed: ${response.status}`);
  const manifest = await response.json();
  
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Atlas image failed to load'));
    img.src = manifest.atlas;
  });
  
  return { manifest, img }; // Return factual, verified data for runtime use
}


```