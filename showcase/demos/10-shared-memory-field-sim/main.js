import { listen, markError, markReady, setDemoStatus } from "../../shared/demo-utils.js";

const DEMO_ID = "10-shared-memory-field-sim";
const W = 64;
const H = 64;

const canvas = document.getElementById("field");
const ctx = canvas ? canvas.getContext("2d") : null;
const pathEl = document.getElementById("path-label");
const isoEl = document.getElementById("iso");
const genEl = document.getElementById("gen");

let worker = null;
let mode = "FALLBACK TRANSFER/COPY";
let field = new Float32Array(W * H);
let control = null;
let generation = 0;
let raf = 0;

function canUseSharedMemory() {
  return Boolean(window.crossOriginIsolated)
    && typeof SharedArrayBuffer === "function"
    && typeof Atomics === "object";
}

function draw() {
  const image = ctx.createImageData(W, H);
  for (let i = 0; i < field.length; i += 1) {
    const v = Math.max(0, Math.min(1, field[i]));
    const o = i * 4;
    image.data[o] = Math.floor(20 + v * 180);
    image.data[o + 1] = Math.floor(40 + v * 120);
    image.data[o + 2] = Math.floor(50 + v * 200);
    image.data[o + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  genEl.textContent = String(Math.floor(generation));
}

function loop() {
  raf = requestAnimationFrame(loop);
  if (mode === "SHARED MEMORY" && control) {
    generation = Atomics.load(control, 1);
  }
  draw();
}

function boot() {
  setDemoStatus(DEMO_ID, "booting", null);
  if (!canvas || !ctx) throw new Error("Field simulator markup is incomplete");
  canvas.width = W;
  canvas.height = H;
  isoEl.textContent = String(Boolean(window.crossOriginIsolated));
  worker = new Worker(new URL("./worker.js", import.meta.url));
  worker.onerror = (event) => {
    markError(DEMO_ID, event.message || "worker failed");
  };
  if (canUseSharedMemory()) {
    mode = "SHARED MEMORY";
    const fieldBuf = new SharedArrayBuffer(W * H * 4);
    const controlBuf = new SharedArrayBuffer(8);
    field = new Float32Array(fieldBuf);
    control = new Int32Array(controlBuf);
    for (let i = 0; i < field.length; i += 1) field[i] = Math.random();
    worker.postMessage({ type: "start-shared", field: fieldBuf, control: controlBuf });
  } else {
    mode = "FALLBACK TRANSFER/COPY";
    worker.onmessage = (event) => {
      if (event.data?.type === "field") {
        field = event.data.field;
        generation = event.data.generation;
      }
    };
    worker.postMessage({ type: "start-fallback" });
  }
  pathEl.textContent = mode;
  listen(window, "pagehide", () => {
    worker.postMessage({ type: "stop" });
    worker.terminate();
    cancelAnimationFrame(raf);
  });
  raf = requestAnimationFrame(loop);
  markReady(DEMO_ID);
}

try {
  boot();
} catch (error) {
  markError(DEMO_ID, error);
}
