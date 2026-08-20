import { listen, markError, markReady, setDemoStatus } from "../../shared/demo-utils.js";

const DEMO_ID = "05-webgl2-particle-arena";
const HIGH_COUNT = 24000;
const LOW_COUNT = 4000;

const VS = `#version 300 es
in vec2 aCorner;
in vec2 aPos;
uniform vec2 uResolution;
uniform float uSize;
void main() {
  vec2 pixel = aPos + aCorner * uSize;
  vec2 clip = (pixel / uResolution) * 2.0 - 1.0;
  gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);
}
`;

const FS = `#version 300 es
precision mediump float;
out vec4 outColor;
uniform vec3 uColor;
void main() {
  outColor = vec4(uColor, 0.85);
}
`;

const canvas = document.getElementById("gl");
const countEl = document.getElementById("count");
const frameEl = document.getElementById("frametime");
const qualityEl = document.getElementById("quality");
const qualityBtn = document.getElementById("quality-btn");
const messageEl = document.getElementById("message");

let gl = null;
let program = null;
let vao = null;
let instanceBuf = null;
let positions = null;
let velocities = null;
let count = HIGH_COUNT;
let reduced = false;
let pointer = { x: 320, y: 180, down: false };
let lastTime = 0;
let raf = 0;
let alive = false;
let frameMs = 0;
let lost = false;

function showMessage(text) {
  messageEl.textContent = text;
  messageEl.classList.remove("hidden");
}

function hideMessage() {
  messageEl.classList.add("hidden");
  messageEl.textContent = "";
}

function compile(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "shader compile failed";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function link(vsSrc, fsSrc) {
  const vs = compile(gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog) || "program link failed";
    gl.deleteProgram(prog);
    throw new Error(log);
  }
  return prog;
}

function seedParticles(n) {
  count = n;
  positions = new Float32Array(n * 2);
  velocities = new Float32Array(n * 2);
  for (let i = 0; i < n; i += 1) {
    positions[i * 2] = Math.random() * canvas.clientWidth;
    positions[i * 2 + 1] = Math.random() * canvas.clientHeight;
    velocities[i * 2] = (Math.random() - 0.5) * 40;
    velocities[i * 2 + 1] = (Math.random() - 0.5) * 40;
  }
}

function createResources() {
  program = link(VS, FS);
  const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  instanceBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuf);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const locCorner = gl.getAttribLocation(program, "aCorner");
  const locPos = gl.getAttribLocation(program, "aPos");
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.enableVertexAttribArray(locCorner);
  gl.vertexAttribPointer(locCorner, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuf);
  gl.enableVertexAttribArray(locPos);
  gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(locPos, 1);
}

function destroyResources() {
  if (!gl) return;
  if (vao) gl.deleteVertexArray(vao);
  if (instanceBuf) gl.deleteBuffer(instanceBuf);
  if (program) gl.deleteProgram(program);
  vao = null;
  instanceBuf = null;
  program = null;
}

function resize() {
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    if (gl) gl.viewport(0, 0, w, h);
  }
}

function setQuality(nextReduced) {
  reduced = nextReduced;
  seedParticles(reduced ? LOW_COUNT : HIGH_COUNT);
  if (gl && instanceBuf) {
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
  }
  qualityEl.textContent = reduced ? "reduced" : "high";
  qualityBtn.textContent = reduced ? "High effects" : "Reduced effects";
  countEl.textContent = String(count);
}

function simulate(dt) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const pull = pointer.down ? 180 : 35;
  for (let i = 0; i < count; i += 1) {
    const ix = i * 2;
    const dx = pointer.x - positions[ix];
    const dy = pointer.y - positions[ix + 1];
    const dist = Math.max(24, Math.hypot(dx, dy));
    velocities[ix] += (dx / dist) * pull * dt;
    velocities[ix + 1] += (dy / dist) * pull * dt;
    velocities[ix] *= 0.98;
    velocities[ix + 1] *= 0.98;
    positions[ix] += velocities[ix] * dt;
    positions[ix + 1] += velocities[ix + 1] * dt;
    if (positions[ix] < 0 || positions[ix] > w) velocities[ix] *= -1;
    if (positions[ix + 1] < 0 || positions[ix + 1] > h) velocities[ix + 1] *= -1;
    positions[ix] = Math.min(w, Math.max(0, positions[ix]));
    positions[ix + 1] = Math.min(h, Math.max(0, positions[ix + 1]));
  }
}

function render() {
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuf);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
  gl.uniform2f(gl.getUniformLocation(program, "uResolution"), canvas.clientWidth, canvas.clientHeight);
  gl.uniform1f(gl.getUniformLocation(program, "uSize"), reduced ? 2.2 : 1.6);
  gl.uniform3f(gl.getUniformLocation(program, "uColor"), 0.49, 0.78, 0.89);
  gl.clearColor(0.04, 0.07, 0.09, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
}

function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!alive || lost || !gl) return;
  if (!lastTime) lastTime = now;
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(Math.max(dt, 0), 0.05);
  frameMs = frameMs * 0.9 + dt * 1000 * 0.1;
  simulate(dt);
  render();
  frameEl.textContent = frameMs.toFixed(2);
  countEl.textContent = String(count);
}

function pointerFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * canvas.clientWidth;
  pointer.y = ((event.clientY - rect.top) / rect.height) * canvas.clientHeight;
}

function boot() {
  setDemoStatus(DEMO_ID, "booting", null);
  if (!canvas || !qualityBtn || !messageEl) throw new Error("Particle arena markup is incomplete");
  gl = canvas.getContext("webgl2", { antialias: false, powerPreference: "high-performance" });
  if (!gl) {
    showMessage("WebGL2 is not available in this browser. This demo requires WebGL2 and will not fall back to Canvas 2D.");
    markReady(DEMO_ID);
    return;
  }
  seedParticles(HIGH_COUNT);
  createResources();
  resize();
  alive = true;
  const disposers = [];
  disposers.push(listen(window, "resize", resize));
  disposers.push(listen(canvas, "pointermove", pointerFromEvent));
  disposers.push(listen(canvas, "pointerdown", (event) => {
    pointer.down = true;
    pointerFromEvent(event);
  }));
  disposers.push(listen(window, "pointerup", () => {
    pointer.down = false;
  }));
  disposers.push(listen(qualityBtn, "click", () => setQuality(!reduced)));
  disposers.push(listen(canvas, "webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    alive = false;
    showMessage("WebGL context lost. Rendering halted. Restoration will rebuild buffers and shaders.");
  }));
  disposers.push(listen(canvas, "webglcontextrestored", () => {
    gl = canvas.getContext("webgl2");
    if (!gl) {
      showMessage("WebGL2 could not be restored.");
      return;
    }
    createResources();
    resize();
    lost = false;
    alive = true;
    lastTime = 0;
    hideMessage();
  }));
  disposers.push(listen(window, "pagehide", () => {
    cancelAnimationFrame(raf);
    alive = false;
    destroyResources();
    while (disposers.length) disposers.pop()();
  }));
  raf = requestAnimationFrame(frame);
  markReady(DEMO_ID);
}

try {
  boot();
} catch (error) {
  showMessage(`WebGL startup failed: ${error.message}`);
  markError(DEMO_ID, error);
}
