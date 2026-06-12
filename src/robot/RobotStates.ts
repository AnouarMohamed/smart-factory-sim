/**
 * Robot state transition map and state construction helpers.
 */

import type { RobotState } from '@types';

export const VALID_ROBOT_TRANSITIONS: Readonly<Record<RobotState['kind'], readonly RobotState['kind'][]>> = {
  IDLE: ['INITIALIZING', 'NAVIGATING', 'CHARGING', 'ERROR', 'EMERGENCY_STOP'],
  INITIALIZING: ['IDLE', 'ERROR', 'EMERGENCY_STOP'],
  NAVIGATING: ['OBSTACLE_BLOCKED', 'LOADING', 'TRANSPORTING', 'CHARGING', 'IDLE', 'ERROR', 'EMERGENCY_STOP'],
  OBSTACLE_BLOCKED: ['NAVIGATING', 'ERROR', 'EMERGENCY_STOP'],
  LOADING: ['TRANSPORTING', 'ERROR', 'EMERGENCY_STOP'],
  TRANSPORTING: ['OBSTACLE_BLOCKED', 'UNLOADING', 'CHARGING', 'ERROR', 'EMERGENCY_STOP'],
  UNLOADING: ['IDLE', 'NAVIGATING', 'ERROR', 'EMERGENCY_STOP'],
  CHARGING: ['IDLE', 'ERROR', 'EMERGENCY_STOP'],
  ERROR: ['INITIALIZING', 'CHARGING', 'EMERGENCY_STOP'],
  EMERGENCY_STOP: ['INITIALIZING']
};

/** Return a default idle state. */
export const idleState = (since: number): RobotState => ({ kind: 'IDLE', since });

/** Return true when a state transition is allowed. */
export const canTransition = (from: RobotState, to: RobotState): boolean =>
  VALID_ROBOT_TRANSITIONS[from.kind].includes(to.kind);

