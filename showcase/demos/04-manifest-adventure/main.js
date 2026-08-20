import { clamp, listen, markError, markReady, setDemoStatus } from "../../shared/demo-utils.js";
import { loadImageAssets, loadManifest } from "./assetLoader.js";

const DEMO_ID = "04-manifest-adventure";
const WORLD_W = 640;
const WORLD_H = 360;
const TILE = 32;
const SPEED = 140;
const MANIFEST_URL = new URL("./assets/manifest.json", import.meta.url);

const REQUIRED_IDS = ["player", "tree", "rock", "well", "chest", "grass"];

const canvas = document.getElementById("game");
const statusEl = document.getElementById("status");
const nearEl = document.getElementById("near");
const ctx = canvas ? canvas.getContext("2d") : null;

const keys = new Set();
const player = { x: 80, y: 80 };
const props = [
  { id: "tree", x: 180, y: 70 },
  { id: "tree", x: 420, y: 40 },
  { id: "rock", x: 300, y: 180 },
  { id: "well", x: 500, y: 220 },
  { id: "chest", x: 240, y: 250, interactable: true },
];

let images = {};
let chestOpen = false;
let lastTime = 0;
let raf = 0;

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr * (rect.width / WORLD_W), 0, 0, dpr * (rect.height / WORLD_H), 0, 0);
}

function nearestInteractable() {
  let best = null;
  let bestDist = 40;
  for (const prop of props) {
    if (!prop.interactable) continue;
    const dist = Math.hypot(prop.x + 16 - player.x, prop.y + 16 - player.y);
    if (dist < bestDist) {
      best = prop;
      bestDist = dist;
    }
  }
  return best;
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
    player.x += (ax / len) * SPEED * dt;
    player.y += (ay / len) * SPEED * dt;
  }
  player.x = clamp(player.x, 16, WORLD_W - 16);
  player.y = clamp(player.y, 16, WORLD_H - 16);
  const near = nearestInteractable();
  nearEl.textContent = near ? near.id : "none";
}

function draw() {
  for (let y = 0; y < WORLD_H; y += TILE) {
    for (let x = 0; x < WORLD_W; x += TILE) {
      ctx.drawImage(images.grass, x, y, TILE, TILE);
    }
  }
  for (const prop of props) {
    ctx.drawImage(images[prop.id], prop.x, prop.y, TILE, TILE);
  }
  ctx.drawImage(images.player, player.x - 16, player.y - 16, TILE, TILE);
}

function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!lastTime) lastTime = now;
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(Math.max(dt, 0), 0.05);
  update(dt);
  draw();
}

async function boot() {
  setDemoStatus(DEMO_ID, "booting", null);
  if (!canvas || !ctx || !statusEl) throw new Error("Adventure markup is incomplete");
  const manifest = await loadManifest(MANIFEST_URL);
  images = await loadImageAssets(manifest, MANIFEST_URL, REQUIRED_IDS);
  fitCanvas();
  statusEl.textContent = chestOpen ? "The chest is open." : "Walk the meadow. Open the chest.";
  const disposers = [];
  disposers.push(listen(window, "resize", fitCanvas));
  disposers.push(listen(window, "keydown", (event) => {
    keys.add(event.key.toLowerCase());
    if (event.key.toLowerCase() === "e" || event.key === " ") {
      const near = nearestInteractable();
      if (near && near.id === "chest") {
        chestOpen = true;
        statusEl.textContent = "Chest opened. The map came from logical IDs, not invented paths.";
      }
    }
  }));
  disposers.push(listen(window, "keyup", (event) => keys.delete(event.key.toLowerCase())));
  disposers.push(listen(window, "blur", () => {
    keys.clear();
    lastTime = 0;
  }));
  disposers.push(listen(window, "pagehide", () => {
    cancelAnimationFrame(raf);
    while (disposers.length) disposers.pop()();
  }));
  raf = requestAnimationFrame(frame);
  markReady(DEMO_ID);
}

try {
  await boot();
} catch (error) {
  markError(DEMO_ID, error);
  if (statusEl) statusEl.textContent = error.message;
}
