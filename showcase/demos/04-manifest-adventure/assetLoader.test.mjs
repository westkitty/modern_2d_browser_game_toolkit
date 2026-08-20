import { requireAsset } from "./assetLoader.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manifest = {
  schemaVersion: 1,
  assets: {
    player: { kind: "image", path: "player.svg" },
  },
};

assert(requireAsset(manifest, "player").path === "player.svg", "known id must resolve");

let threw = false;
try {
  requireAsset(manifest, "missing-sprite");
} catch (error) {
  threw = /Unknown logical asset id/.test(error.message);
}
assert(threw, "unknown logical IDs must fail explicitly");

console.log("PASS assetLoader fixtures");
