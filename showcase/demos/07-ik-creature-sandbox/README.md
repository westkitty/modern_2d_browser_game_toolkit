# Two-Bone IK Creature Sandbox

An analytical two-bone solver drives two creature arms toward a draggable target.

## Why this architecture

A two-segment limb has a closed-form solution. Iterative CCD is not required. IK is presentation geometry, not a physics engine.

## Fixtures

`node ik.test.mjs` covers fully extended, near-root, unreachable clamp, and opposite elbow signs. Poses must stay finite; NaN is a failure.
