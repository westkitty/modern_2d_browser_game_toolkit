import { gridPairs, naivePairs } from "./broadphase.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const agents = [
  { x: 10, y: 10, r: 4 },
  { x: 12, y: 10, r: 4 },
  { x: 200, y: 200, r: 4 },
];
const naive = naivePairs(agents);
assert(naive.length === 3, "naive enumerates all unique pairs");
const grid = gridPairs(agents, 32);
assert(grid.some(([i, j]) => i === 0 && j === 1), "grid still finds nearby pair");
assert(grid.length <= naive.length, "grid never invents extra unique pairs");
console.log("PASS broadphase fixtures");
