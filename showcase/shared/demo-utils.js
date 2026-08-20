export function setDemoStatus(id, state, error = null) {
  window.__DEMO_STATUS__ = { id, state, error };
}

export function markReady(id) {
  setDemoStatus(id, "ready", null);
}

export function markError(id, error) {
  const message = error && error.message ? error.message : String(error);
  setDemoStatus(id, "error", message);
  const host = document.querySelector("[data-demo-root]") || document.body;
  let box = host.querySelector(".demo-error");
  if (!box) {
    box = document.createElement("div");
    box.className = "demo-error";
    box.setAttribute("role", "alert");
    host.prepend(box);
  }
  box.textContent = message;
}

export function bootPlaceholder(id, title) {
  try {
    setDemoStatus(id, "booting", null);
    const root = document.querySelector("[data-demo-root]");
    if (root) {
      const note = root.querySelector(".placeholder-note");
      if (note) {
        note.textContent = `${title} is registered in the launcher but has not been implemented yet.`;
      }
    }
    markReady(id);
  } catch (error) {
    markError(id, error);
  }
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function listen(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
