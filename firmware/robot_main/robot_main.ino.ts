/**
 * Firmware-style setup and loop mirror for the virtual robot.
 */

import { FIRMWARE_CONFIG } from './config.h';

export interface FirmwareRuntime {
  readonly configured: boolean;
  readonly loopDelayMs: number;
}

/** Mirror Arduino setup. */
export const setup = (): FirmwareRuntime => ({
  configured: true,
  loopDelayMs: FIRMWARE_CONFIG.loopDelayMs
});

/** Mirror Arduino loop timing step. */
export const loop = (runtime: FirmwareRuntime): FirmwareRuntime => ({
  configured: runtime.configured,
  loopDelayMs: runtime.loopDelayMs
});

