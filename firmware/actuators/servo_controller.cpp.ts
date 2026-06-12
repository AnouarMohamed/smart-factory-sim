/**
 * Firmware-style servo angle to pulse-width mirror.
 */

/** Convert servo angle to pulse width in microseconds. */
export const angleToPulseMicros = (angleDeg: number): number => 1000 + (Math.max(0, Math.min(180, angleDeg)) / 180) * 1000;

