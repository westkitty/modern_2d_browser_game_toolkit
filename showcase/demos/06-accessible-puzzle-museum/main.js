import { listen, markError, markReady, setDemoStatus } from "../../shared/demo-utils.js";

const DEMO_ID = "06-accessible-puzzle-museum";
const STORAGE_KEY = "demo06-museum";
const TARGET_CHIME = ["low", "high", "mid"];
const TARGET_VAULT = "419";
const TARGET_RELICS = ["Bone", "Coin", "Lens"];

const announceEl = document.getElementById("announce");
const solvedEl = document.getElementById("solved");
const resetBtn = document.getElementById("reset");
const exhibits = [...document.querySelectorAll("[data-exhibit]")];
const roomButtons = [...document.querySelectorAll("[data-room]")];
const relicList = document.getElementById("relics");

let room = 0;
let chime = [];
let relics = ["Lens", "Bone", "Coin"];
let solved = { chime: false, vault: false, relics: false };

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.schemaVersion !== 1) return;
    solved = {
      chime: Boolean(parsed.solved?.chime),
      vault: Boolean(parsed.solved?.vault),
      relics: Boolean(parsed.solved?.relics),
    };
  } catch {
    solved = { chime: false, vault: false, relics: false };
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, solved }));
  } catch {
    // Device storage is optional.
  }
}

function announce(message) {
  announceEl.textContent = "";
  announceEl.textContent = message;
}

function solvedCount() {
  return Object.values(solved).filter(Boolean).length;
}

function showRoom(index, moveFocus) {
  room = index;
  exhibits.forEach((section, i) => {
    section.classList.toggle("hidden", i !== index);
  });
  roomButtons.forEach((button, i) => {
    if (i === index) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (moveFocus) {
    const heading = exhibits[index].querySelector("h2");
    heading.focus();
  }
  announce(`Exhibit ${index + 1} of 3.`);
}

function renderRelics() {
  relicList.replaceChildren();
  relics.forEach((name, index) => {
    const item = document.createElement("li");
    item.innerHTML = `<span>${name}</span> <button type="button" data-up="${index}">Move up</button> <button type="button" data-down="${index}">Move down</button>`;
    relicList.appendChild(item);
  });
}

function refreshStatus() {
  solvedEl.textContent = String(solvedCount());
  document.getElementById("ex0-status").textContent = solved.chime
    ? "Chimes solved."
    : `Sequence: ${chime.join(" · ") || "empty"}`;
  document.getElementById("ex1-status").textContent = solved.vault ? "Vault open." : "Vault locked.";
  document.getElementById("ex2-status").textContent = solved.relics ? "Relics ordered." : "Lineup not yet correct.";
}

function checkRelics() {
  if (relics.join() === TARGET_RELICS.join()) {
    solved.relics = true;
    save();
    announce("Relics are in chronological order.");
  }
  refreshStatus();
}

function resetMuseum() {
  solved = { chime: false, vault: false, relics: false };
  chime = [];
  relics = ["Lens", "Bone", "Coin"];
  document.getElementById("d0").value = "0";
  document.getElementById("d1").value = "0";
  document.getElementById("d2").value = "0";
  save();
  renderRelics();
  refreshStatus();
  showRoom(0, true);
  announce("Museum reset.");
}

function boot() {
  setDemoStatus(DEMO_ID, "booting", null);
  if (!announceEl || !resetBtn || exhibits.length !== 3) {
    throw new Error("Museum markup is incomplete");
  }
  load();
  renderRelics();
  refreshStatus();
  showRoom(0, false);
  const root = document.querySelector("[data-demo-root]");
  listen(root, "click", (event) => {
    const roomBtn = event.target.closest("[data-room]");
    if (roomBtn) {
      showRoom(Number(roomBtn.dataset.room), true);
      return;
    }
    const chimeBtn = event.target.closest("[data-chime]");
    if (chimeBtn && !solved.chime) {
      chime.push(chimeBtn.dataset.chime);
      if (chime.length > 3) chime = chime.slice(-3);
      if (chime.join() === TARGET_CHIME.join()) {
        solved.chime = true;
        save();
        announce("Chime order accepted.");
      }
      refreshStatus();
      return;
    }
    if (event.target.id === "try-vault") {
      const combo = `${document.getElementById("d0").value}${document.getElementById("d1").value}${document.getElementById("d2").value}`;
      if (combo === TARGET_VAULT) {
        solved.vault = true;
        save();
        announce("Vault opens.");
      } else {
        announce("That combination is wrong.");
      }
      refreshStatus();
      return;
    }
    const up = event.target.closest("[data-up]");
    const down = event.target.closest("[data-down]");
    if (up || down) {
      const index = Number((up || down).dataset.up ?? (up || down).dataset.down);
      const swap = up ? index - 1 : index + 1;
      if (swap >= 0 && swap < relics.length) {
        [relics[index], relics[swap]] = [relics[swap], relics[index]];
        renderRelics();
        checkRelics();
        const selector = up ? `[data-up="${swap}"]` : `[data-down="${swap}"]`;
        relicList.querySelector(selector)?.focus();
      }
    }
  });
  listen(resetBtn, "click", resetMuseum);
  markReady(DEMO_ID);
}

try {
  boot();
} catch (error) {
  markError(DEMO_ID, error);
}
