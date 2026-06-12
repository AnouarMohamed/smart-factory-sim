/**
 * Firmware-style HC-SR04 distance conversion mirror.
 */

/** Convert echo pulse microseconds into meters. */
export const pulseMicrosToMeters = (pulseMicros: number): number => (pulseMicros * 0.000343) / 2;

