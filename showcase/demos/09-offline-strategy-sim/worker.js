const SIZE = 5;

function heavyTurn(state) {
  const cells = state.cells.map((cell) => ({ ...cell }));
  for (let i = 0; i < cells.length; i += 1) {
    let acc = cells[i].food + 0.1;
    for (let n = 0; n < 40000; n += 1) {
      acc = 3.7 * acc * (1 - (acc % 1 || 0.01));
    }
    const neighbors = neighborSum(cells, i);
    cells[i].food = Math.max(0, Math.min(9, Math.round(cells[i].food + (neighbors > 12 ? -1 : 1) * ((acc > 0.5) ? 1 : 0))));
    cells[i].threat = (cells[i].threat + Math.floor(acc * 10)) % 5;
  }
  return {
    schemaVersion: 2,
    turn: state.turn + 1,
    cells,
    log: [`Turn ${state.turn + 1} resolved in worker.`, ...(state.log || [])].slice(0, 6),
  };
}

function neighborSum(cells, index) {
  const x = index % SIZE;
  const y = Math.floor(index / SIZE);
  let sum = 0;
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) continue;
      sum += cells[ny * SIZE + nx].food;
    }
  }
  return sum;
}

self.onmessage = (event) => {
  try {
    const next = heavyTurn(event.data);
    self.postMessage({ ok: true, state: next });
  } catch (error) {
    self.postMessage({ ok: false, error: error.message });
  }
};
