/** Typed robot geometry, drivetrain, battery, and sensor constants. */

import type { DifferentialDriveParams } from '@types';

export interface RobotConfig {
  readonly drive: DifferentialDriveParams;
  readonly body: {
    readonly widthM: number;
    readonly lengthM: number;
    readonly heightM: number;
    readonly sensorHeightM: number;
  };
  readonly battery: {
    readonly nominalVoltage: number;
    readonly capacityAh: number;
    readonly lowSocThreshold: number;
    readonly chargeRateSocPerSecond: number;
  };
  readonly sensors: {
    readonly ultrasonicRangeMinM: number;
    readonly ultrasonicRangeMaxM: number;
    readonly ultrasonicConeHalfAngleRad: number;
    readonly irSensorCount: number;
    readonly encoderTicksPerRevolution: number;
  };
  readonly servo: {
    readonly loweredDeg: number;
    readonly raisedDeg: number;
    readonly speedDegPerSecond: number;
  };
}

export const ROBOT_CONFIG: RobotConfig = {
  drive: {
    wheelRadiusM: 0.033,
    trackWidthM: 0.142,
    maxWheelRPM: 300,
    massKg: 0.8,
    momentOfInertiaKgM2: 0.004,
    stallTorqueNm: 0.8
  },
  body: {
    widthM: 0.24,
    lengthM: 0.32,
    heightM: 0.16,
    sensorHeightM: 0.12
  },
  battery: {
    nominalVoltage: 7.4,
    capacityAh: 2.2,
    lowSocThreshold: 20,
    chargeRateSocPerSecond: 0.04
  },
  sensors: {
    ultrasonicRangeMinM: 0.02,
    ultrasonicRangeMaxM: 4,
    ultrasonicConeHalfAngleRad: Math.PI / 12,
    irSensorCount: 5,
    encoderTicksPerRevolution: 320
  },
  servo: {
    loweredDeg: 0,
    raisedDeg: 90,
    speedDegPerSecond: 160
  }
} as const;

