/**
 * Li-ion battery state-of-charge, voltage, current, and health model.
 */

import { ROBOT_CONFIG } from '@config/robot.config';
import type { BatterySnapshot } from '@types';

export class BatteryModel {
  private soc = 100;
  private health = 100;
  private cycleCount = 0;
  private current = 0;

  /** Drain battery based on load and elapsed seconds. */
  public discharge(deltaSeconds: number, loadFactor: number): BatterySnapshot {
    const drain = deltaSeconds * (0.012 + loadFactor * 0.025);
    this.soc = Math.max(0, this.soc - drain);
    this.current = 0.4 + loadFactor * 1.2;
    return this.snapshot();
  }

  /** Charge battery by configured rate. */
  public charge(deltaSeconds: number): BatterySnapshot {
    const previous = this.soc;
    this.soc = Math.min(100, this.soc + deltaSeconds * ROBOT_CONFIG.battery.chargeRateSocPerSecond * 100);
    if (previous < 99 && this.soc >= 99) {
      this.cycleCount += 1;
      this.health = Math.max(70, this.health - 0.02);
    }
    this.current = -1.1;
    return this.snapshot();
  }

  /** Force battery state for failure injection. */
  public setSoc(soc: number): void {
    this.soc = Math.max(0, Math.min(100, soc));
  }

  /** Return current battery telemetry. */
  public snapshot(): BatterySnapshot {
    const voltage = ROBOT_CONFIG.battery.nominalVoltage * (0.86 + this.soc / 700);
    return {
      voltage,
      current: this.current,
      soc: this.soc,
      health: this.health,
      cycleCount: this.cycleCount
    };
  }
}

