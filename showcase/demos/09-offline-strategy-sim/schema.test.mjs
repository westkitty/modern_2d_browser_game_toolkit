import { migrate } from "./schema.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const v1 = { schemaVersion: 1, turn: 4, cells: Array(25).fill(2) };
const migrated = migrate(v1);
assert(migrated.schemaVersion === 2, "migrates to v2");
assert(migrated.cells[0].food === 2 && migrated.cells[0].threat === 0, "v1 numbers become food");

let corrupt = false;
try {
  migrate({ nope: true });
} catch {
  corrupt = true;
}
assert(corrupt, "corrupt payload throws");

console.log("PASS schema migration fixtures");
