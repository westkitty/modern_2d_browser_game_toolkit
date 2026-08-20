const app = document.getElementById("app");
const live = document.getElementById("live");
const STATUS_TIMEOUT_MS = 8000;

let catalog = [];
let activeId = null;
let statusTimer = 0;
let cardEls = [];
let cardIndex = 0;

function announce(message) {
  live.textContent = message;
}

function demoById(id) {
  return catalog.find((item) => item.id === id) || null;
}

function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  const match = hash.match(/^\/demo\/([^/]+)/);
  return match ? match[1] : null;
}

function setRoute(id) {
  if (id) {
    window.location.hash = `#/demo/${id}`;
  } else if (window.location.hash) {
    window.location.hash = "#/";
  }
}

async function loadCatalog() {
  const response = await fetch("./demos.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load demos.json (${response.status})`);
  }
  const data = await response.json();
  if (!data || !Array.isArray(data.demos)) {
    throw new Error("demos.json is missing a demos array");
  }
  catalog = data.demos.slice().sort((a, b) => a.number - b.number);
}

function renderCatalog() {
  activeId = null;
  const heading = document.createElement("h2");
  heading.className = "sr-only";
  heading.textContent = "Demonstration catalog";

  const list = document.createElement("ul");
  list.className = "catalog";
  list.setAttribute("aria-label", "Architecture demonstrations");

  catalog.forEach((demo, index) => {
    const item = document.createElement("li");
    const article = document.createElement("article");
    article.className = "demo-card";
    article.dataset.demoId = demo.id;
    article.tabIndex = index === 0 ? 0 : -1;
    article.setAttribute("aria-labelledby", `title-${demo.id}`);

    const status = demo.status === "ready" ? "ready" : "not-built";
    const statusLabel = status === "ready" ? "Built" : "Not built yet";

    article.innerHTML = `
      <div class="card-top">
        <span class="demo-number">${String(demo.number).padStart(2, "0")}</span>
        <span class="status-pill ${status}">${statusLabel}</span>
      </div>
      <h2 id="title-${demo.id}">${escapeHtml(demo.title)}</h2>
      <p class="architecture">${escapeHtml(demo.architecture)}</p>
      <p class="why"><span class="because">Why this architecture</span>${escapeHtml(demo.why || demo.summary)}</p>
      <ul class="badges">${(demo.capabilities || []).map((cap) => `<li>${escapeHtml(cap)}</li>`).join("")}</ul>
      <div class="actions">
        <button type="button" data-launch="${demo.id}">Launch</button>
        <a class="button secondary" href="./${encodeURI(demo.path)}" target="_blank" rel="noopener">Open standalone</a>
      </div>
    `;
    item.appendChild(article);
    list.appendChild(item);
  });

  app.replaceChildren(heading, list);
  cardEls = [...app.querySelectorAll(".demo-card")];
  cardIndex = 0;
  announce(`${catalog.length} demonstrations available.`);
}

function renderViewer(demo) {
  activeId = demo.id;
  const viewer = document.createElement("section");
  viewer.className = "viewer";
  viewer.innerHTML = `
    <div class="viewer-bar">
      <button type="button" data-home>Back to catalog</button>
      <div class="viewer-copy">
        <h2>${escapeHtml(demo.title)}</h2>
        <p>${escapeHtml(demo.summary)}</p>
      </div>
      <a class="button secondary" href="./${encodeURI(demo.path)}" target="_blank" rel="noopener">Open standalone</a>
    </div>
    <div class="viewer-frame-wrap">
      <iframe title="${escapeHtml(demo.title)}" src="./${encodeURI(demo.path)}" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
      <div class="frame-error hidden" data-frame-error></div>
    </div>
  `;
  app.replaceChildren(viewer);
  const iframe = viewer.querySelector("iframe");
  const errorBox = viewer.querySelector("[data-frame-error]");
  watchDemoStatus(demo, iframe, errorBox);
  announce(`Opened ${demo.title}.`);
}

function showBootError(error) {
  const banner = document.createElement("div");
  banner.className = "error-banner";
  banner.setAttribute("role", "alert");
  banner.textContent = `Launcher failed: ${error.message}`;
  app.replaceChildren(banner);
  announce(banner.textContent);
}

function watchDemoStatus(demo, iframe, errorBox) {
  window.clearInterval(statusTimer);
  const started = Date.now();
  const fail = (message) => {
    window.clearInterval(statusTimer);
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
    announce(message);
  };

  iframe.addEventListener("error", () => {
    fail(`${demo.title} failed to load. The catalog is still available via Back to catalog.`);
  });

  statusTimer = window.setInterval(() => {
    try {
      const status = iframe.contentWindow && iframe.contentWindow.__DEMO_STATUS__;
      if (status && status.state === "ready") {
        window.clearInterval(statusTimer);
        errorBox.classList.add("hidden");
        return;
      }
      if (status && status.state === "error") {
        fail(`${demo.title} reported a startup error: ${status.error || "unknown error"}`);
        return;
      }
    } catch (err) {
      fail(`${demo.title} is not reachable from the launcher (${err.message}).`);
      return;
    }
    if (Date.now() - started > STATUS_TIMEOUT_MS) {
      fail(`${demo.title} did not publish a ready status in time. Use Back to catalog or Open standalone.`);
    }
  }, 200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function focusCard(index) {
  if (!cardEls.length) return;
  cardIndex = (index + cardEls.length) % cardEls.length;
  cardEls.forEach((el, i) => {
    el.tabIndex = i === cardIndex ? 0 : -1;
  });
  cardEls[cardIndex].focus();
}

function routeFromLocation() {
  const id = parseRoute();
  if (!id) {
    renderCatalog();
    return;
  }
  const demo = demoById(id);
  if (!demo) {
    renderCatalog();
    announce(`Unknown demonstration ${id}. Showing catalog.`);
    return;
  }
  renderViewer(demo);
}

app.addEventListener("click", (event) => {
  const launch = event.target.closest("[data-launch]");
  if (launch) {
    setRoute(launch.getAttribute("data-launch"));
    return;
  }
  if (event.target.closest("[data-home]")) {
    setRoute(null);
  }
});

app.addEventListener("keydown", (event) => {
  if (!cardEls.length || activeId) return;
  const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End", "Enter"];
  if (!keys.includes(event.key)) return;
  if (event.key === "Enter") {
    const id = document.activeElement?.dataset?.demoId;
    if (id) {
      event.preventDefault();
      setRoute(id);
    }
    return;
  }
  event.preventDefault();
  if (event.key === "ArrowRight" || event.key === "ArrowDown") focusCard(cardIndex + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") focusCard(cardIndex - 1);
  if (event.key === "Home") focusCard(0);
  if (event.key === "End") focusCard(cardEls.length - 1);
});

window.addEventListener("hashchange", routeFromLocation);

try {
  await loadCatalog();
  routeFromLocation();
} catch (error) {
  showBootError(error);
}
