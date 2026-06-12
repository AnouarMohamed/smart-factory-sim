/**
 * Three-shift scheduler for worker density, lighting, and production rate.
 */

import { FACTORY_CONFIG } from '@config/factory.config';
import type { ShiftDefinition, ShiftId } from '@types';

export class ShiftScheduler {
  /** Return active shift for a simulated hour. */
  public activeShift(hour: number): ShiftDefinition {
    const normalized = ((hour % 24) + 24) % 24;
    const shift = FACTORY_CONFIG.shifts.find((candidate) => {
      if (candidate.startsAtHour < candidate.endsAtHour) {
        return normalized >= candidate.startsAtHour && normalized < candidate.endsAtHour;
      }

      return normalized >= candidate.startsAtHour || normalized < candidate.endsAtHour;
    });

    return shift ?? FACTORY_CONFIG.shifts[0];
  }

  /** Return active shift id for a simulated hour. */
  public activeShiftId(hour: number): ShiftId {
    return this.activeShift(hour).id;
  }
}

