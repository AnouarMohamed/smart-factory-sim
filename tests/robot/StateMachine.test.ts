import { describe, expect, it } from 'vitest';
import { EventBus } from '@core/EventBus';
import { idleState } from '@robot/RobotStates';
import { StateMachine } from '@robot/StateMachine';

describe('StateMachine', () => {
  it('accepts valid transitions', () => {
    const machine = new StateMachine('r1', idleState(0), new EventBus());

    const accepted = machine.transition({
      kind: 'INITIALIZING',
      step: 'BOOT',
      progress: 0
    });

    expect(accepted).toBe(true);
  });

  it('rejects invalid transitions', () => {
    const machine = new StateMachine('r1', idleState(0), new EventBus());

    const accepted = machine.transition({
      kind: 'UNLOADING',
      targetDock: 'dock-1',
      step: 'ALIGN',
      armAngle: 0
    });

    expect(accepted).toBe(false);
  });
});

