/**
 * Firmware-style state transition helper mirrored in TypeScript.
 */

export type FirmwareState = 'IDLE' | 'NAVIGATING' | 'BLOCKED' | 'ERROR' | 'CHARGING';

const TRANSITIONS: Readonly<Record<FirmwareState, readonly FirmwareState[]>> = {
  IDLE: ['NAVIGATING', 'CHARGING', 'ERROR'],
  NAVIGATING: ['BLOCKED', 'IDLE', 'ERROR'],
  BLOCKED: ['NAVIGATING', 'ERROR'],
  ERROR: ['IDLE'],
  CHARGING: ['IDLE', 'ERROR']
};

/** Return true when a firmware transition is valid. */
export const firmwareCanTransition = (from: FirmwareState, to: FirmwareState): boolean =>
  TRANSITIONS[from].includes(to);

