/**
 * Firmware-style IR array line-error calculation mirror.
 */

const WEIGHTS: readonly [number, number, number, number, number] = [-2, -1, 0, 1, 2];

/** Compute weighted line error from five digital IR readings. */
export const computeLineError = (readings: readonly [boolean, boolean, boolean, boolean, boolean]): number => {
  const active = readings
    .map((reading, index) => (reading ? WEIGHTS[index] : 0))
    .filter((value) => value !== 0);
  if (active.length === 0) {
    return 0;
  }

  return active.reduce((sum, value) => sum + value, 0) / active.length;
};

