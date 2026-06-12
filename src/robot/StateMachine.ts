/**
 * Typed finite state machine for robot operating states.
 */

import type { EventBus } from '@core/EventBus';
import type { RobotState } from '@types';
import { canTransition } from './RobotStates';

export class StateMachine {
  private currentState: RobotState;

  public constructor(
    private readonly robotId: string,
    initialState: RobotState,
    private readonly eventBus: EventBus
  ) {
    this.currentState = initialState;
  }

  /** Return the current robot state. */
  public current(): RobotState {
    return this.currentState;
  }

  /** Attempt a transition and return true when accepted. */
  public transition(nextState: RobotState): boolean {
    if (!canTransition(this.currentState, nextState)) {
      return false;
    }

    const previous = this.currentState;
    this.currentState = nextState;
    this.eventBus.emit('robot:state-changed', {
      robotId: this.robotId,
      from: previous,
      to: nextState
    });
    return true;
  }

  /** Force a state during reset or test setup. */
  public replace(nextState: RobotState): void {
    const previous = this.currentState;
    this.currentState = nextState;
    this.eventBus.emit('robot:state-changed', {
      robotId: this.robotId,
      from: previous,
      to: nextState
    });
  }
}

