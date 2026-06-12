/** Shared physics primitives for motion, collision, and controls. */

export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Pose2D extends Vector2 {
  readonly theta: number;
}

export interface WheelAngularVelocity {
  readonly leftRadPerSec: number;
  readonly rightRadPerSec: number;
}

export interface WheelState {
  readonly leftRPM: number;
  readonly rightRPM: number;
  readonly leftSlip: boolean;
  readonly rightSlip: boolean;
}

export interface KinematicState {
  readonly pose: Pose2D;
  readonly linearVelocity: number;
  readonly angularVelocity: number;
  readonly wheels: WheelState;
}

export interface DifferentialDriveParams {
  readonly wheelRadiusM: number;
  readonly trackWidthM: number;
  readonly maxWheelRPM: number;
  readonly massKg: number;
  readonly momentOfInertiaKgM2: number;
  readonly stallTorqueNm: number;
}

export interface PIDGains {
  readonly kp: number;
  readonly ki: number;
  readonly kd: number;
}

export interface PIDLimits {
  readonly min: number;
  readonly max: number;
}

export interface PIDTerms {
  readonly error: number;
  readonly p: number;
  readonly i: number;
  readonly d: number;
  readonly output: number;
}

export interface PIDOptions {
  readonly gains: PIDGains;
  readonly outputLimits: PIDLimits;
  readonly derivativeFilter: number;
}

export interface AABB {
  readonly min: Vector2;
  readonly max: Vector2;
}

export interface Circle {
  readonly center: Vector2;
  readonly radius: number;
}

export interface FrictionZone {
  readonly id: string;
  readonly bounds: AABB;
  readonly coefficient: number;
}

export interface PayloadDynamicsResult {
  readonly combinedMassKg: number;
  readonly centerOfGravity: Vector3;
  readonly tippingRisk: number;
}

