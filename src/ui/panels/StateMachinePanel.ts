/**
 * State machine panel renderer with current state and recent transition target.
 */

import type { RobotDigitalTwin } from '@types';

export class StateMachinePanel {
  /** Render state machine status. */
  public render(twin: RobotDigitalTwin | null): string {
    const state = twin?.state.kind ?? 'OFFLINE';
    const states = [
      'IDLE',
      'INITIALIZING',
      'NAVIGATING',
      'OBSTACLE_BLOCKED',
      'LOADING',
      'TRANSPORTING',
      'UNLOADING',
      'CHARGING',
      'ERROR',
      'EMERGENCY_STOP'
    ];

    return `<section class="panel">
      <h2>State Machine</h2>
      <div class="state-list">
        ${states.map((item) => `<span class="${item === state ? 'active' : ''}">${item}</span>`).join('')}
      </div>
    </section>`;
  }
}

