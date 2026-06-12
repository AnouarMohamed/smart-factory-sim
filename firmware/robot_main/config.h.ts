/**
 * Firmware-style pin and timing constants mirrored in TypeScript.
 */

export const FIRMWARE_CONFIG = {
  pins: {
    motorLeftPwm: 5,
    motorRightPwm: 6,
    servo: 9,
    ultrasonicTrig: 10,
    ultrasonicEcho: 11
  },
  loopDelayMs: 10,
  mqttKeepaliveSeconds: 30
} as const;

