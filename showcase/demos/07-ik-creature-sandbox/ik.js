/**
 * Analytical two-bone IK. Returns joint angles in radians.
 * elbowSign +1 bends one way, -1 the other.
 */
export function solveTwoBoneIK(root, target, lenA, lenB, elbowSign = 1) {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const dist = Math.hypot(dx, dy);
  const maxReach = lenA + lenB;
  const minReach = Math.abs(lenA - lenB);
  const clamped = Math.min(maxReach, Math.max(minReach, dist || 0));
  const reachX = dist === 0 ? root.x + clamped : root.x + (dx / dist) * clamped;
  const reachY = dist === 0 ? root.y : root.y + (dy / dist) * clamped;
  const rx = reachX - root.x;
  const ry = reachY - root.y;
  const d2 = rx * rx + ry * ry;
  const d = Math.sqrt(d2) || 1e-9;
  let cosMid = (lenA * lenA + d2 - lenB * lenB) / (2 * lenA * d);
  cosMid = Math.min(1, Math.max(-1, cosMid));
  const mid = Math.acos(cosMid);
  const base = Math.atan2(ry, rx);
  const sign = elbowSign >= 0 ? 1 : -1;
  const angleA = base + sign * mid;
  const joint = {
    x: root.x + Math.cos(angleA) * lenA,
    y: root.y + Math.sin(angleA) * lenA,
  };
  const angleB = Math.atan2(reachY - joint.y, reachX - joint.x);
  const end = { x: joint.x + Math.cos(angleB) * lenB, y: joint.y + Math.sin(angleB) * lenB };
  return {
    angleA,
    angleB,
    joint,
    end,
    reachable: dist <= maxReach + 1e-6,
    distance: dist,
  };
}

export function isFinitePose(pose) {
  return [pose.angleA, pose.angleB, pose.joint.x, pose.joint.y, pose.end.x, pose.end.y]
    .every((n) => Number.isFinite(n));
}
