import { describe, expect, it } from 'vitest';
import { EventBus } from '@core/EventBus';
import { DigitalTwin } from '@iot/DigitalTwin';
import type { RobotDigitalTwin } from '@types';

const twin: RobotDigitalTwin = {
  id: 'r1',
  timestamp: 0,
  pose: { x: 0, y: 0, theta: 0 },
  velocity: { linear: 0, angular: 0 },
  wheels: { leftRPM: 0, rightRPM: 0, leftSlip: false, rightSlip: false },
  state: { kind: 'IDLE', since: 0 },
  currentTask: null,
  path: [],
  eta: null,
  payload: null,
  armAngle: 0,
  armState: 'LOWERED',
  sensors: {
    ultrasonic: { distanceM: 1, valid: true, coneHits: [], rays: [] },
    irArray: { readings: [0.9, 0.9, 0.1, 0.9, 0.9], digital: [false, false, true, false, false], lineError: 0, confidence: 1 },
    encoder: { leftTicks: 0, rightTicks: 0, leftRPM: 0, rightRPM: 0 },
    imu: { acceleration: { x: 0, y: 0, z: 9.8 }, gyroscope: { x: 0, y: 0, z: 0 }, driftBias: { x: 0, y: 0, z: 0 } }
  },
  battery: { voltage: 7.4, current: 0, soc: 100, health: 100, cycleCount: 0 },
  maintenance: { motorHours: 0, liftCycles: 0, bearingWear: 0 },
  anomalies: [],
  alerts: []
};

describe('DigitalTwin', () => {
  it('stores robot snapshots', () => {
    const digitalTwin = new DigitalTwin(new EventBus());

    digitalTwin.setRobot(twin);

    expect(digitalTwin.getRobot('r1')?.id).toBe('r1');
  });
});

