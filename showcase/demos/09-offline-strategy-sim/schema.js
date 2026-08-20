export const CURRENT_VERSION = 2;
export const SIZE = 5;

export function emptyState() {
  const cells = [];
  for (let i = 0; i < SIZE * SIZE; i += 1) {
    cells.push({ food: 3 + (i % 4), threat: i % 3 });
  }
  return { schemaVersion: CURRENT_VERSION, turn: 1, cells, log: ["New campaign."] };
}

export function migrate(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Save is not an object");
  }
  if (raw.schemaVersion === CURRENT_VERSION) {
    if (!Array.isArray(raw.cells) || raw.cells.length !== SIZE * SIZE) {
      throw new Error("Save grid is the wrong size");
    }
    return raw;
  }
  if (raw.schemaVersion === 1) {
    const cells = (raw.cells || []).map((value) => (
      typeof value === "number" ? { food: value, threat: 0 } : { food: 0, threat: 0 }
    ));
    if (cells.length !== SIZE * SIZE) throw new Error("v1 save grid is the wrong size");
    return {
      schemaVersion: CURRENT_VERSION,
      turn: Number(raw.turn) || 1,
      cells,
      log: ["Migrated from schemaVersion 1."],
    };
  }
  throw new Error(`Unsupported schemaVersion ${raw.schemaVersion}`);
}
