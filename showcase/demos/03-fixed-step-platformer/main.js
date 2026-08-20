import { clamp, listen, markError, markReady, setDemoStatus } from "../../shared/demo-utils.js";
import { applyRadialDeadzone } from "./deadzone.js";

const DEMO_ID = "03-fixed-step-platformer";
const STEP = 1 / 60;
const MAX_STEPS = 5;
const WORLD_W = 640;
const WORLD_H = 360;
const GRAVITY = 1400;
const MOVE = 210;
const JUMP = -430;

const canvas = document.getElementById("game");
const stepsEl = document.getElementById("steps");
const alphaEl = document.getElementById("alpha");
const padEl = document.getElementById("pad");
const resetBtn = document.getElementById("reset");
const ctx = canvas ? canvas.getContext("2d") : null;

const platforms = [
  { x: 0, y: 320, w: 640, h: 40 },
  { x: 80, y: 250, w: 140, h: 16 },
  { x: 260, y: 200, w: 130, h: 16 },
  { x: 430, y: 150, w: 150, h: 16 },
];
const door = { x: 545, y: 102, w: 18, h: 48 };

function makePlayer() {
  return {
    x: 40,
    y: 280,
    w: 18,
    h: 28,
    vx: 0,
    vy: 0,
    onGround: false,
    prevX: 40,
    prevY: 280,
    won: false,
  };
}

const keys = new Set();
const actions = { move: 0, jump: false, jumpHeld: false };
let player = makePlayer();
let accumulator = 0;
let lastTime = 0;
let lastSteps = 0;
let lastAlpha = 0;
let padConnected = false;
let raf = 0;

function aabbOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function snapHistory() {
  player.prevX = player.x;
  player.prevY = player.y;
}

function reset() {
  player = makePlayer();
  accumulator = 0;
  lastTime = 0;
  keys.clear();
  actions.move = 0;
  actions.jump = false;
  snapHistory();
}

function pollGamepad() {
  padConnected = false;
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const pad of pads) {
    if (!pad) continue;
    padConnected = true;
    const stick = applyRadialDeadzone(pad.axes[0] || 0, pad.axes[1] || 0, 0.25);
    if (Math.abs(stick.x) > 0.01) actions.move = stick.x;
    if (pad.buttons[0]?.pressed && !actions.jumpHeld) actions.jump = true;
    actions.jumpHeld = Boolean(pad.buttons[0]?.pressed);
    break;
  }
  padEl.textContent = padConnected ? "gamepad" : "keyboard";
}

function readKeyboardActions() {
  let move = 0;
  if (keys.has("arrowleft") || keys.has("a")) move -= 1;
  if (keys.has("arrowright") || keys.has("d")) move += 1;
  if (move) actions.move = move;
  else if (!padConnected) actions.move = 0;
  if ((keys.has(" ") || keys.has("arrowup") || keys.has("w")) && !actions.jumpHeld) {
    actions.jump = true;
  }
  actions.jumpHeld = keys.has(" ") || keys.has("arrowup") || keys.has("w") || actions.jumpHeld;
}

function simulate() {
  player.prevX = player.x;
  player.prevY = player.y;
  player.vx = actions.move * MOVE;
  player.vy += GRAVITY * STEP;
  if (actions.jump && player.onGround) {
    player.vy = JUMP;
    player.onGround = false;
  }
  actions.jump = false;

  player.x += player.vx * STEP;
  player.x = clamp(player.x, 0, WORLD_W - player.w);
  for (const plat of platforms) {
    if (aabbOverlap(player, plat)) {
      if (player.vx > 0) player.x = plat.x - player.w;
      else if (player.vx < 0) player.x = plat.x + plat.w;
      player.vx = 0;
    }
  }

  player.y += player.vy * STEP;
  player.onGround = false;
  for (const plat of platforms) {
    if (aabbOverlap(player, plat)) {
      if (player.vy > 0) {
        player.y = plat.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0) {
        player.y = plat.y + plat.h;
        player.vy = 0;
      }
    }
  }

  if (aabbOverlap(player, door)) player.won = true;
}

function draw(alpha) {
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
  ctx.fillStyle = "#0f1a22";
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  ctx.fillStyle = "#2c4454";
  for (const plat of platforms) ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
  ctx.fillStyle = "#c4a574";
  ctx.fillRect(door.x, door.y, door.w, door.h);
  const x = player.prevX + (player.x - player.prevX) * alpha;
  const y = player.prevY + (player.y - player.prevY) * alpha;
  ctx.fillStyle = player.won ? "#2f6b3a" : "#7ec8e3";
  ctx.fillRect(x, y, player.w, player.h);
}

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr * (rect.width / WORLD_W), 0, 0, dpr * (rect.height / WORLD_H), 0, 0);
}

function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!lastTime) lastTime = now;
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  if (!Number.isFinite(dt) || dt < 0) dt = 0;
  accumulator += dt;
  const backlog = STEP * MAX_STEPS;
  if (accumulator > backlog) accumulator = backlog;
  actions.move = padConnected ? actions.move : 0;
  pollGamepad();
  readKeyboardActions();
  let steps = 0;
  while (accumulator >= STEP) {
    simulate();
    accumulator -= STEP;
    steps += 1;
  }
  lastSteps = steps;
  lastAlpha = accumulator / STEP;
  stepsEl.textContent = String(lastSteps);
  alphaEl.textContent = lastAlpha.toFixed(2);
  draw(lastAlpha);
}

function boot() {
  setDemoStatus(DEMO_ID, "booting", null);
  if (!canvas || !ctx || !resetBtn) throw new Error("Platformer markup is incomplete");
  fitCanvas();
  const disposers = [];
  disposers.push(listen(window, "resize", fitCanvas));
  disposers.push(listen(window, "blur", () => {
    keys.clear();
    lastTime = 0;
  }));
  disposers.push(listen(window, "keydown", (event) => {
    keys.add(event.key.toLowerCase());
    if (event.key === " ") event.preventDefault();
  }));
  disposers.push(listen(window, "keyup", (event) => keys.delete(event.key.toLowerCase())));
  disposers.push(listen(resetBtn, "click", reset));
  disposers.push(listen(window, "gamepadconnected", () => {
    padEl.textContent = "gamepad";
  }));
  disposers.push(listen(window, "pagehide", () => {
    cancelAnimationFrame(raf);
    while (disposers.length) disposers.pop()();
  }));
  reset();
  raf = requestAnimationFrame(frame);
  markReady(DEMO_ID);
}

try {
  boot();
} catch (error) {
  markError(DEMO_ID, error);
}
