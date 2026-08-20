/**
 * Scaled radial deadzone for analog sticks.
 * Values inside the radius collapse to zero. Outside, the remaining
 * range is remapped to 0..1 so the edge of the deadzone is not a jump.
 */
export function applyRadialDeadzone(x, y, deadzone = 0.25) {
  const nx = Number(x) || 0;
  const ny = Number(y) || 0;
  const dz = Math.min(0.95, Math.max(0, Number(deadzone) || 0));
  const mag = Math.hypot(nx, ny);
  if (mag <= dz) {
    return { x: 0, y: 0, magnitude: 0 };
  }
  const scaled = (mag - dz) / (1 - dz);
  const factor = scaled / mag;
  return { x: nx * factor, y: ny * factor, magnitude: scaled };
}
