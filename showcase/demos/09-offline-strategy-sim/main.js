import { listen, markError, markReady, setDemoStatus } from "../../shared/demo-utils.js";
import { emptyState, migrate } from "./schema.js";
import { readSave, writeSave } from "./db.js";

const DEMO_ID = "09-offline-strategy-sim";
const SAVE_KEY = "campaign";
const V1_FIXTURE = { schemaVersion: 1, turn: 3, cells: Array(25).fill(4) };

const gridEl = document.getElementById("grid");
const turnEl = document.getElementById("turn");
const busyEl = document.getElementById("busy");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");
const endBtn = document.getElementById("end-turn");

let state = emptyState();
let worker = null;
let busy = false;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("demo-error", isError);
}

function render() {
  turnEl.textContent = String(state.turn);
  gridEl.replaceChildren();
  state.cells.forEach((cell, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.setAttribute("role", "gridcell");
    button.textContent = `#${index} food ${cell.food} threat ${cell.threat}`;
    gridEl.appendChild(button);
  });
  logEl.replaceChildren();
  (state.log || []).forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    logEl.appendChild(item);
  });
}

function ensureWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./worker.js", import.meta.url));
  worker.onmessage = (event) => {
    busy = false;
    busyEl.textContent = "Idle";
    endBtn.disabled = false;
    if (!event.data?.ok) {
      setStatus(`Worker failed: ${event.data?.error || "unknown error"}. You can end the turn again.`, true);
      return;
    }
    state = event.data.state;
    setStatus(`Turn ${state.turn} arrived from the worker.`);
    render();
  };
  worker.onerror = (event) => {
    busy = false;
    busyEl.textContent = "Idle";
    endBtn.disabled = false;
    setStatus(`Worker error: ${event.message}. Recover by ending the turn again.`, true);
  };
  return worker;
}

async function saveNow() {
  try {
    await writeSave(SAVE_KEY, state);
    setStatus("Saved to IndexedDB.");
  } catch (error) {
    setStatus(`Save failed; success was not claimed. ${error.message}`, true);
  }
}

async function loadNow(raw) {
  try {
    state = migrate(raw);
    setStatus(`Loaded schemaVersion ${state.schemaVersion}.`);
    render();
  } catch (error) {
    setStatus(`Load rejected: ${error.message}`, true);
  }
}

function boot() {
  setDemoStatus(DEMO_ID, "booting", null);
  if (!gridEl || !endBtn) throw new Error("Strategy markup is incomplete");
  render();
  listen(endBtn, "click", () => {
    if (busy) return;
    busy = true;
    busyEl.textContent = "Worker calculating…";
    endBtn.disabled = true;
    setStatus("UI remains on this page while the worker runs.");
    ensureWorker().postMessage(state);
  });
  listen(document.getElementById("save"), "click", saveNow);
  listen(document.getElementById("load"), "click", async () => {
    try {
      const raw = await readSave(SAVE_KEY);
      if (!raw) {
        setStatus("No save yet.", true);
        return;
      }
      await loadNow(raw);
    } catch (error) {
      setStatus(`Load failed: ${error.message}`, true);
    }
  });
  listen(document.getElementById("load-v1"), "click", () => loadNow(V1_FIXTURE));
  listen(document.getElementById("load-corrupt"), "click", () => loadNow({ broken: true }));
  markReady(DEMO_ID);
}

try {
  boot();
} catch (error) {
  markError(DEMO_ID, error);
}
