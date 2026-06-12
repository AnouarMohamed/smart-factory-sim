/**
 * Tracks component wear and maintenance counters for each virtual robot.
 */

import type { MaintenanceSnapshot } from '@types';

export class MaintenanceTracker {
  private motorHours = 0;
  private liftCycles = 0;
  private bearingWear = 0;

  /** Advance maintenance counters from motion and lift activity. */
  public step(deltaSeconds: number, moving: boolean, liftCycleCompleted: boolean): MaintenanceSnapshot {
    if (moving) {
      this.motorHours += deltaSeconds / 3600;
      this.bearingWear = Math.min(100, this.bearingWear + deltaSeconds * 0.0002);
    }

    if (liftCycleCompleted) {
      this.liftCycles += 1;
    }

    return this.snapshot();
  }

  /** Return current maintenance counters. */
  public snapshot(): MaintenanceSnapshot {
    return {
      motorHours: this.motorHours,
      liftCycles: this.liftCycles,
      bearingWear: this.bearingWear
    };
  }
}

