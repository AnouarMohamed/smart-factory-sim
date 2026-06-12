/**
 * Discrete PID controller with anti-windup, derivative filtering, and term telemetry.
 */

import type { PIDGains, PIDLimits, PIDOptions, PIDTerms } from '@types';

export class PIDController {
  private gains: PIDGains;
  private readonly outputLimits: PIDLimits;
  private readonly derivativeFilter: number;
  private integral = 0;
  private previousError = 0;
  private filteredDerivative = 0;
  private terms: PIDTerms = { error: 0, p: 0, i: 0, d: 0, output: 0 };

  public constructor(options: PIDOptions) {
    this.gains = options.gains;
    this.outputLimits = options.outputLimits;
    this.derivativeFilter = Math.max(0, Math.min(1, options.derivativeFilter));
  }

  /** Compute PID output for a setpoint, measurement, and timestep in seconds. */
  public compute(setpoint: number, measurement: number, dtSeconds: number): number {
    const safeDt = Math.max(dtSeconds, 0.000001);
    const error = setpoint - measurement;
    const derivative = (error - this.previousError) / safeDt;
    this.filteredDerivative =
      this.derivativeFilter * this.filteredDerivative + (1 - this.derivativeFilter) * derivative;

    const proposedIntegral = this.integral + error * safeDt;
    const p = this.gains.kp * error;
    const i = this.gains.ki * proposedIntegral;
    const d = this.gains.kd * this.filteredDerivative;
    const unclamped = p + i + d;
    const output = this.clamp(unclamped);

    if (output === unclamped || Math.sign(error) !== Math.sign(output - unclamped)) {
      this.integral = proposedIntegral;
    }

    this.previousError = error;
    this.terms = {
      error,
      p,
      i: this.gains.ki * this.integral,
      d,
      output
    };
    return output;
  }

  /** Reset accumulated controller memory. */
  public reset(): void {
    this.integral = 0;
    this.previousError = 0;
    this.filteredDerivative = 0;
    this.terms = { error: 0, p: 0, i: 0, d: 0, output: 0 };
  }

  /** Update controller gains without resetting controller memory. */
  public setGains(kp: number, ki: number, kd: number): void {
    this.gains = { kp, ki, kd };
  }

  /** Return the latest PID terms for oscilloscope display. */
  public getTerms(): PIDTerms {
    return this.terms;
  }

  private clamp(value: number): number {
    return Math.max(this.outputLimits.min, Math.min(this.outputLimits.max, value));
  }
}

