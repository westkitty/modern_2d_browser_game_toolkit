import { applyRadialDeadzone } from "./deadzone.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function almost(a, b, eps = 1e-9) {
  return Math.abs(a - b) <= eps;
}

const dead = applyRadialDeadzone(0.1, 0.1, 0.25);
assert(dead.x === 0 && dead.y === 0, "inside radius must be zero");

const edge = applyRadialDeadzone(0.25, 0, 0.25);
assert(edge.x === 0 && edge.y === 0, "exact deadzone radius must be zero");

const axis = applyRadialDeadzone(1, 0, 0.25);
assert(almost(axis.x, 1) && almost(axis.y, 0), "full deflection on axis maps to 1");

const diag = applyRadialDeadzone(0.7, 0.7, 0.25);
assert(diag.magnitude > 0, "diagonal outside radius remains live");
assert(almost(diag.x, diag.y), "diagonal components stay equal after scaling");

const opposite = applyRadialDeadzone(-1, 0, 0.25);
assert(almost(opposite.x, -1), "opposite direction preserves sign");

console.log("PASS deadzone fixtures");
