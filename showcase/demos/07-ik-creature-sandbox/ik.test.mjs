import { isFinitePose, solveTwoBoneIK } from "./ik.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const root = { x: 0, y: 0 };
const lenA = 100;
const lenB = 80;

const extended = solveTwoBoneIK(root, { x: 180, y: 0 }, lenA, lenB, 1);
assert(isFinitePose(extended), "fully extended must be finite");
assert(Math.abs(extended.end.x - 180) < 1e-6, "fully extended reaches the sum of lengths");

const near = solveTwoBoneIK(root, { x: 0, y: 0 }, lenA, lenB, 1);
assert(isFinitePose(near), "near-root target must be finite");
assert(Math.abs(Math.hypot(near.joint.x, near.joint.y) - lenA) < 1e-6, "upper bone keeps length near root");

const unreachable = solveTwoBoneIK(root, { x: 400, y: 0 }, lenA, lenB, 1);
assert(isFinitePose(unreachable), "unreachable target must stay finite");
assert(unreachable.reachable === false, "unreachable flag");
assert(Math.abs(unreachable.end.x - (lenA + lenB)) < 1e-6, "unreachable clamps to max reach");

const plus = solveTwoBoneIK(root, { x: 120, y: 20 }, lenA, lenB, 1);
const minus = solveTwoBoneIK(root, { x: 120, y: 20 }, lenA, lenB, -1);
assert(isFinitePose(plus) && isFinitePose(minus), "both elbow signs finite");
assert(Math.sign(plus.joint.y) !== Math.sign(minus.joint.y) || Math.abs(plus.joint.y - minus.joint.y) > 1,
  "opposite bend directions differ");

console.log("PASS two-bone IK fixtures");
