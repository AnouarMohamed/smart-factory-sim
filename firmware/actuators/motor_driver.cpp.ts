/**
 * Firmware-style L298N PWM to normalized motor command mirror.
 */

/** Clamp PWM command to signed 8-bit range. */
export const clampPwm = (pwm: number): number => Math.max(-255, Math.min(255, Math.round(pwm)));

