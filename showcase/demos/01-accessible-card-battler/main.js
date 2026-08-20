import { markError, markReady, setDemoStatus, listen } from "../../shared/demo-utils.js";

const DEMO_ID = "01-accessible-card-battler";
const MAX_HP = 20;
const STORAGE_KEY = "demo01-settings";

const CARDS = [
  {
    id: "strike",
    name: "Strike",
    blurb: "Deal 6 damage to the Warden.",
    apply(state) {
      state.enemyHp = Math.max(0, state.enemyHp - 6);
      return "You strike for 6.";
    },
  },
  {
    id: "guard",
    name: "Guard",
    blurb: "Gain 5 block against the next blow.",
    apply(state) {
      state.playerBlock += 5;
      return "You brace for 5 block.";
    },
  },
  {
    id: "mend",
    name: "Mend",
    blurb: "Restore 5 hit points.",
    apply(state) {
      state.playerHp = Math.min(MAX_HP, state.playerHp + 5);
      return "You mend 5 hit points.";
    },
  },
];

const ENEMY_MOVES = [
  { name: "Strike 5", damage: 5, heal: 0 },
  { name: "Slam 8", damage: 8, heal: 0 },
  { name: "Recover 3", damage: 0, heal: 3 },
];

const els = {
  announce: document.getElementById("announce"),
  enemyHp: document.getElementById("enemy-hp"),
  enemyBar: document.getElementById("enemy-bar"),
  enemyIntent: document.getElementById("enemy-intent"),
  playerHp: document.getElementById("player-hp"),
  playerBar: document.getElementById("player-bar"),
  playerBlock: document.getElementById("player-block"),
  turn: document.getElementById("turn"),
  hand: document.getElementById("hand"),
  endPanel: document.getElementById("end-panel"),
  endTitle: document.getElementById("end-title"),
  endCopy: document.getElementById("end-copy"),
  restart: document.getElementById("restart"),
};

let state;
let focusIndex = 0;
const disposers = [];

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { schemaVersion: 1, wins: 0 };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.schemaVersion !== 1) return { schemaVersion: 1, wins: 0 };
    return { schemaVersion: 1, wins: Number(parsed.wins) || 0 };
  } catch {
    return { schemaVersion: 1, wins: 0 };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Persistence is optional; a quota failure must not break play.
  }
}

function freshState() {
  return {
    playerHp: MAX_HP,
    enemyHp: MAX_HP,
    playerBlock: 0,
    turn: 1,
    moveIndex: 0,
    phase: "player",
    settings: loadSettings(),
  };
}

function announce(message) {
  els.announce.textContent = "";
  els.announce.textContent = message;
}

function render() {
  els.enemyHp.textContent = String(state.enemyHp);
  els.playerHp.textContent = String(state.playerHp);
  els.playerBlock.textContent = String(state.playerBlock);
  els.turn.textContent = String(state.turn);
  els.enemyBar.style.width = `${(state.enemyHp / MAX_HP) * 100}%`;
  els.playerBar.style.width = `${(state.playerHp / MAX_HP) * 100}%`;
  const intent = ENEMY_MOVES[state.moveIndex % ENEMY_MOVES.length];
  els.enemyIntent.textContent = intent.name;

  const locked = state.phase !== "player";
  const buttons = [...els.hand.querySelectorAll("button.card")];
  buttons.forEach((button, index) => {
    button.disabled = locked;
    button.tabIndex = index === focusIndex ? 0 : -1;
    button.setAttribute("aria-disabled", locked ? "true" : "false");
  });

  if (state.phase === "won" || state.phase === "lost") {
    els.endPanel.classList.remove("hidden");
    els.endTitle.textContent = state.phase === "won" ? "You win" : "You are down";
    els.endCopy.textContent = state.phase === "won"
      ? `The Warden falls on turn ${state.turn}. Wins recorded on this device: ${state.settings.wins}.`
      : "Your hit points reached zero. Restart to try another line.";
  } else {
    els.endPanel.classList.add("hidden");
  }
}

function finishIfNeeded(extra) {
  if (state.enemyHp <= 0) {
    state.phase = "won";
    state.settings.wins += 1;
    saveSettings(state.settings);
    announce(`${extra} The Warden falls. You win.`);
    render();
    els.restart.focus();
    return true;
  }
  if (state.playerHp <= 0) {
    state.phase = "lost";
    announce(`${extra} You collapse. The duel is lost.`);
    render();
    els.restart.focus();
    return true;
  }
  return false;
}

function enemyAct() {
  const move = ENEMY_MOVES[state.moveIndex % ENEMY_MOVES.length];
  state.moveIndex += 1;
  let note = `Warden uses ${move.name}.`;
  if (move.heal) {
    state.enemyHp = Math.min(MAX_HP, state.enemyHp + move.heal);
    note += ` It recovers ${move.heal}.`;
  }
  if (move.damage) {
    const soaked = Math.min(state.playerBlock, move.damage);
    const through = move.damage - soaked;
    state.playerBlock = Math.max(0, state.playerBlock - soaked);
    state.playerHp = Math.max(0, state.playerHp - through);
    note += soaked
      ? ` Block absorbs ${soaked}; ${through} damage lands.`
      : ` You take ${through} damage.`;
  }
  return note;
}

function playCard(cardId) {
  if (state.phase !== "player") return;
  const card = CARDS.find((item) => item.id === cardId);
  if (!card) return;
  state.phase = "resolving";
  const playerNote = card.apply(state);
  if (finishIfNeeded(playerNote)) return;
  const enemyNote = enemyAct();
  if (finishIfNeeded(`${playerNote} ${enemyNote}`)) return;
  state.turn += 1;
  state.phase = "player";
  announce(`${playerNote} ${enemyNote} Your turn ${state.turn}.`);
  render();
}

function restart() {
  state = freshState();
  focusIndex = 0;
  announce("New duel. Choose a card.");
  render();
  const first = els.hand.querySelector("button.card");
  if (first) first.focus();
}

function buildHand() {
  els.hand.replaceChildren();
  CARDS.forEach((card, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "card";
    button.dataset.cardId = card.id;
    button.setAttribute("role", "listitem");
    button.tabIndex = index === 0 ? 0 : -1;
    button.innerHTML = `<span class="cost">Card ${index + 1}</span><strong>${card.name}</strong><span>${card.blurb}</span>`;
    els.hand.appendChild(button);
  });
}

function onHandClick(event) {
  const button = event.target.closest("button.card");
  if (!button || !els.hand.contains(button)) return;
  playCard(button.dataset.cardId);
}

function onHandKey(event) {
  const buttons = [...els.hand.querySelectorAll("button.card")];
  if (!buttons.length) return;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    focusIndex = (focusIndex + 1) % buttons.length;
    buttons[focusIndex].focus();
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    focusIndex = (focusIndex + buttons.length - 1) % buttons.length;
    buttons[focusIndex].focus();
  }
}

function boot() {
  setDemoStatus(DEMO_ID, "booting", null);
  for (const el of Object.values(els)) {
    if (!el) throw new Error("Card battler markup is incomplete");
  }
  buildHand();
  disposers.push(listen(els.hand, "click", onHandClick));
  disposers.push(listen(els.hand, "keydown", onHandKey));
  disposers.push(listen(els.restart, "click", restart));
  disposers.push(listen(window, "pagehide", () => {
    while (disposers.length) disposers.pop()();
  }));
  restart();
  markReady(DEMO_ID);
}

try {
  boot();
} catch (error) {
  markError(DEMO_ID, error);
}
