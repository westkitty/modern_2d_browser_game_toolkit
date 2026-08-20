import { clamp, listen, markError, markReady, setDemoStatus } from "../../shared/demo-utils.js";

const DEMO_ID = "02-canvas-arcade-dodger";
const WORLD_W = 640;
const WORLD_H = 360;
const PLAYER_R = 12;
const MAX_DT = 1 / 20;
const PLAYER_SPEED = 220;

const canvas = document.getElementById("game");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const dprEl = document.getElementById("dpr");
const muteBtn = document.getElementById("mute");
const restartBtn = document.getElementById("restart");
const banner = document.getElementById("banner");
const ctx = canvas ? canvas.getContext("2d") : null;

const keys = new Set();
const hazards = [];
let dpr = 1;
let playing = false;
let muted = false;
let score = 0;
let best = 0;
let spawnAcc = 0;
let lastTime = 0;
let raf = 0;
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function beep(freq, dur, gainValue) {
  const audio = ensureAudio();
  if (!audio || muted) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = freq;
  gain.gain.value = gainValue;
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  const now = audio.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.stop(now + dur);
}

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr * (rect.width / WORLD_W), 0, 0, dpr * (rect.height / WORLD_H), 0, 0);
  dprEl.textContent = dpr.toFixed(2);
}

function resetRun() {
  hazards.length = 0;
  score = 0;
  spawnAcc = 0;
  playing = true;
  lastTime = 0;
  player.x = WORLD_W / 2;
  player.y = WORLD_H / 2;
  keys.clear();
  banner.textContent = "Survive.";
  beep(440, 0.08, 0.04);
}

const player = { x: WORLD_W / 2, y: WORLD_H / 2 };

function spawnHazard() {
  const edge = Math.floor(Math.random() * 4);
  const speed = 90 + score * 8 + Math.random() * 40;
  const r = 8 + Math.random() * 10;
  const hazard = { x: 0, y: 0, vx: 0, vy: 0, r };
  if (edge === 0) {
    hazard.x = Math.random() * WORLD_W;
    hazard.y = -r;
    hazard.vy = speed;
  } else if (edge === 1) {
    hazard.x = WORLD_W + r;
    hazard.y = Math.random() * WORLD_H;
    hazard.vx = -speed;
  } else if (edge === 2) {
    hazard.x = Math.random() * WORLD_W;
    hazard.y = WORLD_H + r;
    hazard.vy = -speed;
  } else {
    hazard.x = -r;
    hazard.y = Math.random() * WORLD_H;
    hazard.vx = speed;
  }
  hazards.push(hazard);
}

function update(dt) {
  let ax = 0;
  let ay = 0;
  if (keys.has("arrowleft") || keys.has("a")) ax -= 1;
  if (keys.has("arrowright") || keys.has("d")) ax += 1;
  if (keys.has("arrowup") || keys.has("w")) ay -= 1;
  if (keys.has("arrowdown") || keys.has("s")) ay += 1;
  if (ax || ay) {
    const len = Math.hypot(ax, ay);
    player.x += (ax / len) * PLAYER_SPEED * dt;
    player.y += (ay / len) * PLAYER_SPEED * dt;
  }
  player.x = clamp(player.x, PLAYER_R, WORLD_W - PLAYER_R);
  player.y = clamp(player.y, PLAYER_R, WORLD_H - PLAYER_R);

  spawnAcc += dt;
  const interval = Math.max(0.28, 0.85 - score * 0.03);
  while (spawnAcc >= interval) {
    spawnAcc -= interval;
    spawnHazard();
  }

  for (const hazard of hazards) {
    hazard.x += hazard.vx * dt;
    hazard.y += hazard.vy * dt;
    const dx = hazard.x - player.x;
    const dy = hazard.y - player.y;
    if (dx * dx + dy * dy < (hazard.r + PLAYER_R) * (hazard.r + PLAYER_R)) {
      playing = false;
      best = Math.max(best, Math.floor(score));
      banner.textContent = `Hit. Score ${Math.floor(score)}. Press Restart.`;
      beep(110, 0.2, 0.06);
      return;
    }
  }
  for (let i = hazards.length - 1; i >= 0; i -= 1) {
    const h = hazards[i];
    if (h.x < -40 || h.x > WORLD_W + 40 || h.y < -40 || h.y > WORLD_H + 40) {
      hazards.splice(i, 1);
    }
  }
  score += dt;
  scoreEl.textContent = String(Math.floor(score));
  bestEl.textContent = String(best);
}

function draw() {
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
  ctx.fillStyle = "#0f1a22";
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  ctx.fillStyle = "#7ec8e3";
  ctx.beginPath();
  ctx.arc(player.x, player.y, PLAYER_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c44536";
  for (const hazard of hazards) {
    ctx.beginPath();
    ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!lastTime) {
    lastTime = now;
    draw();
    return;
  }
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  if (!playing) {
    draw();
    return;
  }
  if (!Number.isFinite(dt) || dt < 0) dt = 0;
  dt = Math.min(dt, MAX_DT);
  update(dt);
  draw();
}

function keyFromEvent(event) {
  return event.key.toLowerCase();
}

function onBlur() {
  keys.clear();
  lastTime = 0;
}

function boot() {
  setDemoStatus(DEMO_ID, "booting", null);
  if (!canvas || !ctx || !scoreEl || !restartBtn || !muteBtn || !banner || !dprEl || !bestEl) {
    throw new Error("Canvas 2D is unavailable or dodger markup is incomplete");
  }
  fitCanvas();
  const disposers = [];
  disposers.push(listen(window, "resize", fitCanvas));
  disposers.push(listen(window, "blur", onBlur));
  disposers.push(listen(document, "visibilitychange", () => {
    if (document.hidden) onBlur();
    else lastTime = 0;
  }));
  disposers.push(listen(window, "keydown", (event) => {
    keys.add(keyFromEvent(event));
  }));
  disposers.push(listen(window, "keyup", (event) => {
    keys.delete(keyFromEvent(event));
  }));
  disposers.push(listen(restartBtn, "click", () => {
    ensureAudio();
    resetRun();
  }));
  disposers.push(listen(muteBtn, "click", () => {
    muted = !muted;
    muteBtn.textContent = muted ? "Unmute audio" : "Mute audio";
    if (!muted) ensureAudio();
  }));
  disposers.push(listen(window, "pagehide", () => {
    cancelAnimationFrame(raf);
    while (disposers.length) disposers.pop()();
  }));
  raf = requestAnimationFrame(frame);
  markReady(DEMO_ID);
}

try {
  boot();
} catch (error) {
  markError(DEMO_ID, error);
}
