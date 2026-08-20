const W = 64;
const H = 64;
let mode = "fallback";
let field = new Float32Array(W * H);
let control = null;
let running = false;

function step() {
  const next = new Float32Array(field.length);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const i = y * W + x;
      const n = field[(y * W + ((x + 1) % W))]
        + field[(y * W + ((x + W - 1) % W))]
        + field[(((y + 1) % H) * W + x)]
        + field[(((y + H - 1) % H) * W + x)];
      next[i] = (field[i] * 0.7 + n * 0.07 + Math.sin((x + y) * 0.12) * 0.02) % 1;
    }
  }
  field.set(next);
}

function loopShared() {
  if (!running) return;
  step();
  Atomics.add(control, 1, 1);
  Atomics.notify(control, 1);
  setTimeout(loopShared, 16);
}

function tickFallback() {
  if (!running) return;
  step();
  self.postMessage({ type: "field", field, generation: performance.now() });
  setTimeout(tickFallback, 32);
}

self.onmessage = (event) => {
  const msg = event.data;
  if (msg.type === "start-shared") {
    mode = "shared";
    control = new Int32Array(msg.control);
    field = new Float32Array(msg.field);
    running = true;
    loopShared();
  }
  if (msg.type === "start-fallback") {
    mode = "fallback";
    running = true;
    for (let i = 0; i < field.length; i += 1) field[i] = Math.random();
    tickFallback();
  }
  if (msg.type === "stop") running = false;
};
