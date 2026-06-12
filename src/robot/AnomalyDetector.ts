/**
 * Rolling baseline anomaly detector for virtual robot telemetry.
 */

import type { AnomalyRecord, BatterySnapshot, EncoderReading, IMUReading, UltrasonicReading } from '@types';

export class AnomalyDetector {
  private readonly anomalies: AnomalyRecord[] = [];
  private lastUltrasonic: UltrasonicReading | null = null;

  /** Inspect sensor and battery readings and append anomalies when thresholds are exceeded. */
  public inspect(
    robotId: string,
    timestamp: number,
    ultrasonic: UltrasonicReading,
    encoder: EncoderReading,
    imu: IMUReading,
    battery: BatterySnapshot
  ): readonly AnomalyRecord[] {
    if (this.lastUltrasonic && ultrasonic.distanceM - this.lastUltrasonic.distanceM > 0.25) {
      this.add(robotId, timestamp, 'ULTRASONIC_DRIFT', 'Ultrasonic distance jumped beyond baseline.');
    }

    if (Math.abs(encoder.leftTicks - encoder.rightTicks) > 240) {
      this.add(robotId, timestamp, 'ENCODER_MISMATCH', 'Wheel encoder counts diverged under paired drive.');
    }

    if (Math.abs(imu.gyroscope.z) > 0.08 && Math.abs(encoder.leftRPM) < 1 && Math.abs(encoder.rightRPM) < 1) {
      this.add(robotId, timestamp, 'IMU_BIAS', 'Gyroscope reports yaw while the robot is stationary.');
    }

    if (battery.soc < 8) {
      this.add(robotId, timestamp, 'BATTERY_CRITICAL', 'Battery state of charge is critically low.');
    }

    this.lastUltrasonic = ultrasonic;
    return this.anomalies;
  }

  private add(robotId: string, timestamp: number, type: string, description: string): void {
    this.anomalies.push({
      id: `${robotId}-${type}-${timestamp.toFixed(0)}`,
      type,
      severity: type === 'BATTERY_CRITICAL' ? 'CRITICAL' : 'WARNING',
      description,
      timestamp,
      affectedComponent: type.split('_')[0].toLowerCase()
    });
  }
}

