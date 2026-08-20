import { listen, markError, markReady, setDemoStatus } from "../../shared/demo-utils.js";
import { solveTwoBoneIK } from "./ik.js";

const DEMO_ID = "07-ik-creature-sandbox";
const WORLD_W = 640;
const WORLD_H = 360;
const LEN_A = 90;
const LEN_B = 70;

const canvas = document.getElementById("game");
const ctx = canvas ? canvas.getContext("2d") : null;
const angA = document.getElementById("ang-a");
const angB = document.getElementById("ang-b");
const reachEl = document.getElementById("reach");

const roots = [
  { x: 220, y: 180 },
  { x: 420, y: 180 },
];
let target = { x: 320, y: 80 };
let dragging = false;
let elbowSign = 1;
let raf = 0;

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr * (rect.width / WORLD_W), 0, 0, dpr * (rect.height / WORLD_H), 0, 0);
}

function worldFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * WORLD_W,
    y: ((event.clientY - rect.top) / rect.height) * WORLD_H,
  };
}

function deg(rad) {
  return `${Math.round(rad * 180 / Math.PI)}°`;
}

function draw() {
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
  ctx.fillStyle = "#0f1a22";
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  ctx.fillStyle = "#2c4454";
  ctx.beginPath();
  ctx.arc(320, 180, 28, 0, Math.PI * 2);
  ctx.fill();
  const poses = roots.map((root) => solveTwoBoneIK(root, target, LEN_A, LEN_B, elbowSign));
  poses.forEach((pose, i) => {
    const root = roots[i];
    ctx.strokeStyle = "#7ec8e3";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(root.x, root.y);
    ctx.lineTo(pose.joint.x, pose.joint.y);
    ctx.lineTo(pose.end.x, pose.end.y);
    ctx.stroke();
    ctx.fillStyle = "#c4a574";
    for (const p of [root, pose.joint, pose.end]) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.strokeStyle = "#c44536";
  ctx.beginPath();
  ctx.arc(target.x, target.y, 10, 0, Math.PI * 2);
  ctx.stroke();
  angA.textContent = deg(poses[0].angleA);
  angB.textContent = deg(poses[0].angleB);
  reachEl.textContent = poses[0].reachable ? "in" : "clamped";
}

function loop() {
  raf = requestAnimationFrame(loop);
  draw();
}

function boot() {
  setDemoStatus(DEMO_ID, "booting", null);
  if (!canvas || !ctx) throw new Error("IK sandbox markup is incomplete");
  fitCanvas();
  listen(window, "resize", fitCanvas);
  listen(canvas, "pointerdown", (event) => {
    dragging = true;
    target = worldFromEvent(event);
    canvas.setPointerCapture(event.pointerId);
  });
  listen(canvas, "pointermove", (event) => {
    if (dragging) target = worldFromEvent(event);
  });
  listen(window, "pointerup", () => {
    dragging = false;
  });
  document.querySelectorAll("input[name=bend]").forEach((input) => {
    listen(input, "change", () => {
      elbowSign = Number(input.value);
    });
  });
  raf = requestAnimationFrame(loop);
  markReady(DEMO_ID);
}

try {
  boot();
} catch (error) {
  markError(DEMO_ID, error);
}
