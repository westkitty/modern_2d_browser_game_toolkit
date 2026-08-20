export function naivePairs(agents) {
  const pairs = [];
  for (let i = 0; i < agents.length; i += 1) {
    for (let j = i + 1; j < agents.length; j += 1) {
      pairs.push([i, j]);
    }
  }
  return pairs;
}

export function gridPairs(agents, cellSize) {
  const buckets = new Map();
  agents.forEach((agent, index) => {
    const cx = Math.floor(agent.x / cellSize);
    const cy = Math.floor(agent.y / cellSize);
    const key = `${cx},${cy}`;
    const list = buckets.get(key);
    if (list) list.push(index);
    else buckets.set(key, [index]);
  });
  const seen = new Set();
  const pairs = [];
  for (const [key, list] of buckets) {
    const [cx, cy] = key.split(",").map(Number);
    for (let ox = -1; ox <= 1; ox += 1) {
      for (let oy = -1; oy <= 1; oy += 1) {
        const other = buckets.get(`${cx + ox},${cy + oy}`);
        if (!other) continue;
        for (const i of list) {
          for (const j of other) {
            if (j <= i) continue;
            const id = `${i}:${j}`;
            if (seen.has(id)) continue;
            seen.add(id);
            pairs.push([i, j]);
          }
        }
      }
    }
  }
  return pairs;
}

export function collideCircles(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy <= (a.r + b.r) * (a.r + b.r);
}
