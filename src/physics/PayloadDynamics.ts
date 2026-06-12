/**
 * Payload mass, center-of-gravity, and tipping-risk estimator.
 */

import type { Payload, PayloadDynamicsResult, Vector3 } from '@types';

export class PayloadDynamics {
  public constructor(
    private readonly robotMassKg: number,
    private readonly robotCenterOfGravity: Vector3
  ) {}

  /** Estimate combined mass, center of gravity, and normalized tipping risk. */
  public estimate(payload: Payload | null, armAngleDeg: number): PayloadDynamicsResult {
    if (!payload) {
      return {
        combinedMassKg: this.robotMassKg,
        centerOfGravity: this.robotCenterOfGravity,
        tippingRisk: 0
      };
    }

    const payloadCog: Vector3 = {
      x: 0.12 + Math.sin((armAngleDeg * Math.PI) / 180) * 0.08,
      y: 0,
      z: 0.08 + payload.dimensionsM.height / 2
    };
    const combinedMassKg = this.robotMassKg + payload.weightKg;
    const centerOfGravity: Vector3 = {
      x:
        (this.robotCenterOfGravity.x * this.robotMassKg + payloadCog.x * payload.weightKg) /
        combinedMassKg,
      y:
        (this.robotCenterOfGravity.y * this.robotMassKg + payloadCog.y * payload.weightKg) /
        combinedMassKg,
      z:
        (this.robotCenterOfGravity.z * this.robotMassKg + payloadCog.z * payload.weightKg) /
        combinedMassKg
    };

    return {
      combinedMassKg,
      centerOfGravity,
      tippingRisk: Math.min(1, Math.abs(centerOfGravity.x) / 0.18)
    };
  }
}

