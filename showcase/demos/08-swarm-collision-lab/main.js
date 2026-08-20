import { listen, markError, markReady, setDemoStatus } from "../../shared/demo-utils.js";
import { collideCircles, gridPairs, naivePairs } from "./broadphase.js";

const DEMO_ID = "08-swarm-collision-lab";
const WORLD_W = 640;
const WORLD_H = 360;
const CELL = 28;

const canvas = document.getElementById("game");
const ctx = canvas ? canvas.getContext("2d") : null;
const countInput = document.getElementById("count");
const modeSel = document.getElementById("mode");
const layoutSel = document.getElementById("layout");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

let agents = [];
let paused = false;
let lastTime = 0;
let frameMs = 0;
let raf = 0;

function spawn() {
  const n = Number(countInput.value);
  agents = [];
  const clustered = layoutSel.value === "clustered";
  for (let i = 0; i < n; i += 1) {
    const cx = clustered ? 320 + (Math.random() - 0.5) * 70 : Math.random() * WORLD_W;
    const cy = clustered ? 180 + (Math.random() - 0.5) * 70 : Math.random() * WORLD_H;
    agents.push({
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 80,
      vy: (Math.random() - 0.5) * 80,
      r: 6,
      hit: false,
    });
  }
}

function step(dt) {
  for (const agent of agents) {
    agent.x += agent.vx * dt;
    agent.y += agent.vy * dt;
    if (agent.x < agent.r || agent.x > WORLD_W - agent.r) agent.vx *= -1;
    if (agent.y < agent.r || agent.y > WORLD_H - agent.r) agent.vy *= -1;
    agent.hit = false;
  }
  const t0 = performance.now();
  const pairs = modeSel.value === "grid" ? gridPairs(agents, CELL) : naivePairs(agents);
  let narrow = 0;
  for (const [i, j] of pairs) {
    narrow += 1;
    if (collideCircles(agents[i], agents[j])) {
      agents[i].hit = true;
      agents[j].hit = true;
    }
  }
  const updateMs = performance.now() - t0;
  document.getElementById("m-count").textContent = String(agents.length);
  document.getElementById("m-cand").textContent = String(pairs.length);
  document.getElementById("m-narrow").textContent = String(narrow);
  document.getElementById("m-update").textContent = updateMs.toFixed(2);
}

function draw() {
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
  ctx.fillStyle = "#0b141a";
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  for (const agent of agents) {
    ctx.fillStyle = agent.hit ? "#c44536" : "#7ec8e3";
    ctx.beginPath();
    ctx.arc(agent.x, agent.y, agent.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr * (rect.width / WORLD_W), 0, 0, dpr * (rect.height / WORLD_H), 0, 0);
}

function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!lastTime) lastTime = now;
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(Math.max(dt, 0), 0.05);
  frameMs = frameMs * 0.9 + dt * 1000 * 0.1;
  if (!paused) step(dt);
  draw();
  document.getElementById("m-frame").textContent = frameMs.toFixed(2);
}

function boot() {
  setDemoStatus(DEMO_ID, "booting", null);
  if (!canvas || !ctx) throw new Error("Swarm lab markup is incomplete");
  fitCanvas();
  spawn();
  listen(window, "resize", fitCanvas);
  listen(countInput, "change", spawn);
  listen(layoutSel, "change", spawn);
  listen(resetBtn, "click", spawn);
  listen(pauseBtn, "click", () => {
    paused = !paused;
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  });
  raf = requestAnimationFrame(frame);
  markReady(DEMO_ID);
}

try {
  boot();
} catch (error) {
  markError(DEMO_ID, error);
}
