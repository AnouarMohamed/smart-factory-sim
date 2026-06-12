/**
 * Firmware-style quadrature encoder tick accumulator mirror.
 */

/** Add signed encoder ticks. */
export const addEncoderTicks = (currentTicks: number, deltaTicks: number): number => currentTicks + deltaTicks;

