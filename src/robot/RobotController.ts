/**
 * Robot orchestrator for path following, state, sensors, battery, and digital twin snapshots.
 */

import { FACTORY_CONFIG } from '@config/factory.config';
import { ROBOT_CONFIG } from '@config/robot.config';
import type { EventBus } from '@core/EventBus';
import { DifferentialDrive } from '@physics/DifferentialDrive';
import { KinematicSolver } from '@physics/KinematicSolver';
import { PIDController } from '@physics/PIDController';
import type {
  EncoderReading,
  IMUReading,
  IRSensorArrayReading,
  Pose2D,
  RobotDigitalTwin,
  Task,
  UltrasonicReading,
  Vector2
} from '@types';
import { AnomalyDetector } from './AnomalyDetector';
import { BatteryModel } from './BatteryModel';
import { MaintenanceTracker } from './MaintenanceTracker';
import { idleState } from './RobotStates';
import { ServoController } from './ServoController';
import { StateMachine } from './StateMachine';
import { WheelController } from './WheelController';

type MissionPhase = 'TO_PICKUP' | 'LOADING' | 'TO_DROPOFF' | 'UNLOADING' | 'TO_CHARGER' | 'CHARGING' | 'IDLE';

const ARRIVAL_RADIUS_M = 0.6;
const LOAD_DWELL_MS = 1100;
const UNLOAD_DWELL_MS = 1100;
const CHARGE_DWELL_MS = 4500;

export class RobotController {
  private readonly drive = new DifferentialDrive();
  private readonly wheels = new WheelController(this.drive);
  private readonly headingPid = new PIDController({
    gains: { kp: 4.2, ki: 0.02, kd: 0.4 },
    outputLimits: { min: -2.8, max: 2.8 },
    derivativeFilter: 0.72
  });
  private readonly solver = new KinematicSolver();
  private readonly servo = new ServoController();
  private readonly battery = new BatteryModel();
  private readonly maintenance = new MaintenanceTracker();
  private readonly anomalyDetector = new AnomalyDetector();
  private readonly stateMachine: StateMachine;
  private pose: Pose2D;
  private path: Vector2[] = [];
  private pathIndex = 0;
  private currentTask: Task | null = null;
  private pickupPath: readonly Vector2[] = [];
  private dropoffPath: readonly Vector2[] = [];
  private chargerPath: readonly Vector2[] = [];
  private missionPhase: MissionPhase = 'IDLE';
  private phaseStartedAt = 0;
  private payloadOnboard = false;
  private latestTwin: RobotDigitalTwin;

  public constructor(
    public readonly id: string,
    startPose: Pose2D,
    private readonly eventBus: EventBus
  ) {
    this.pose = startPose;
    this.stateMachine = new StateMachine(id, idleState(0), eventBus);
    this.latestTwin = this.createTwin(0, 0, 0);
  }

  /** Assign a task and path to the robot. */
  public assignTask(task: Task, path: readonly Vector2[], timestamp: number): void {
    this.currentTask = task;
    this.path = path.slice();
    this.pathIndex = Math.min(1, Math.max(0, this.path.length - 1));
    this.missionPhase = 'TO_PICKUP';
    this.payloadOnboard = false;
    this.stateMachine.transition({
      kind: 'NAVIGATING',
      destination: task.pickup,
      path,
      eta: this.estimateEta(path)
    });
    this.eventBus.emit('fleet:task-assigned', {
      taskId: task.id,
      robotId: this.id,
      score: 1,
      reason: 'Initial nearest available robot assignment'
    });
    this.latestTwin = this.createTwin(timestamp, 0, 0);
  }

  /** Assign a full mission with pickup, dropoff, and charger segments. */
  public assignMission(
    task: Task,
    pickupPath: readonly Vector2[],
    dropoffPath: readonly Vector2[],
    chargerPath: readonly Vector2[],
    timestamp: number
  ): void {
    this.currentTask = task;
    this.pickupPath = pickupPath;
    this.dropoffPath = dropoffPath;
    this.chargerPath = chargerPath;
    this.payloadOnboard = false;
    this.setSegment('TO_PICKUP', pickupPath, timestamp);
    this.eventBus.emit('fleet:task-assigned', {
      taskId: task.id,
      robotId: this.id,
      score: 1,
      reason: 'Operator configured route assignment'
    });
    this.latestTwin = this.createTwin(timestamp, 0, 0);
  }

  /** Advance the robot simulation and return the latest digital twin snapshot. */
  public step(deltaMs: number, timestamp: number): RobotDigitalTwin {
    const deltaSeconds = deltaMs / 1000;
    this.stepMissionActions(timestamp);
    const motionState = this.stateMachine.current();
    const command =
      motionState.kind === 'NAVIGATING' || motionState.kind === 'TRANSPORTING'
        ? this.followPath(deltaSeconds, timestamp)
        : { linear: 0, angular: 0 };

    const wheelCommand = this.wheels.setVelocity(command.linear, command.angular);
    const kinematics = this.drive.integrate(
      this.pose,
      wheelCommand,
      deltaSeconds,
      FACTORY_CONFIG.floorFrictionCoefficient
    );
    this.pose = kinematics.pose;
    this.wheels.updateFeedback(kinematics.wheels);

    const battery =
      motionState.kind === 'CHARGING'
        ? this.battery.charge(deltaSeconds)
        : this.battery.discharge(deltaSeconds, Math.abs(command.linear));

    if (battery.soc < ROBOT_CONFIG.battery.lowSocThreshold && motionState.kind !== 'CHARGING') {
      this.eventBus.emit('robot:battery-low', { robotId: this.id, level: battery.soc });
    }

    const armAngle = this.servo.step(deltaSeconds);
    const maintenance = this.maintenance.step(deltaSeconds, Math.abs(command.linear) > 0.02, false);
    const sensors = this.syntheticSensors(timestamp, kinematics.wheels.leftRPM, kinematics.wheels.rightRPM);
    const anomalies = this.anomalyDetector.inspect(
      this.id,
      timestamp,
      sensors.ultrasonic,
      sensors.encoder,
      sensors.imu,
      battery
    );

    this.latestTwin = {
      id: this.id,
      timestamp,
      pose: this.pose,
      velocity: { linear: kinematics.linearVelocity, angular: kinematics.angularVelocity },
      wheels: kinematics.wheels,
      state: this.stateMachine.current(),
      currentTask: this.currentTask,
      path: this.path,
      eta: this.estimateEta(this.path.slice(this.pathIndex)),
      payload: this.payloadOnboard ? this.currentTask?.payload ?? null : null,
      armAngle,
      armState: this.servo.state(),
      sensors,
      battery,
      maintenance,
      anomalies,
      alerts: anomalies.map((anomaly) => ({
        id: anomaly.id,
        severity: anomaly.severity,
        message: anomaly.description,
        timestamp: anomaly.timestamp,
        source: anomaly.affectedComponent
      }))
    };

    this.eventBus.emit('robot:position-updated', { robotId: this.id, pose: this.pose });
    this.eventBus.emit('robot:twin-updated', { robotId: this.id, twin: this.latestTwin });
    return this.latestTwin;
  }

  /** Read the latest twin without advancing simulation. */
  public twin(): RobotDigitalTwin {
    return this.latestTwin;
  }

  /** Return the robot's current pose for route replanning. */
  public currentPose(): Pose2D {
    return this.pose;
  }

  /** Trigger an emergency stop state. */
  public emergencyStop(reason: string, timestamp: number): void {
    this.stateMachine.transition({ kind: 'EMERGENCY_STOP', reason, triggeredAt: timestamp });
    this.eventBus.emit('robot:emergency-stop', { robotId: this.id, reason });
  }

  private followPath(deltaSeconds: number, timestamp: number): { readonly linear: number; readonly angular: number } {
    const target = this.path[this.pathIndex];
    if (!target) {
      this.completeCurrentSegment(timestamp);
      return { linear: 0, angular: 0 };
    }

    const distance = this.solver.distanceTo(this.pose, target);
    if (distance < ARRIVAL_RADIUS_M) {
      this.pathIndex += 1;
      if (this.pathIndex >= this.path.length) {
        this.completeCurrentSegment(timestamp);
        return { linear: 0, angular: 0 };
      }
    }

    const nextTarget = this.path[this.pathIndex] ?? target;
    const desiredHeading = this.solver.headingTo(this.pose, nextTarget);
    const headingError = this.solver.angleError(this.pose.theta, desiredHeading);
    this.headingPid.compute(0, -headingError, deltaSeconds);
    this.pose = { ...this.pose, theta: desiredHeading };
    const angular = 0;
    const linear = Math.min(0.95, this.drive.maxLinearSpeedMps());
    return { linear, angular };
  }

  private setSegment(phase: MissionPhase, path: readonly Vector2[], timestamp: number): void {
    this.missionPhase = phase;
    this.phaseStartedAt = timestamp;
    this.path = path.slice();
    this.pathIndex = Math.min(1, Math.max(0, this.path.length - 1));
    const destination = this.path[this.path.length - 1] ?? this.pose;
    const state =
      phase === 'TO_DROPOFF'
        ? ({
            kind: 'TRANSPORTING',
            payload: this.currentTask?.payload ?? {
              id: 'virtual-payload',
              itemId: 'merchandise',
              weightKg: 1,
              dimensionsM: { width: 0.28, depth: 0.22, height: 0.18 }
            },
            destination,
            eta: this.estimateEta(path)
          } as const)
        : ({
            kind: 'NAVIGATING',
            destination,
            path,
            eta: this.estimateEta(path)
          } as const);

    if (!this.stateMachine.transition(state)) {
      this.stateMachine.replace(state);
    }
  }

  private completeCurrentSegment(timestamp: number): void {
    if (this.missionPhase === 'TO_PICKUP') {
      this.missionPhase = 'LOADING';
      this.phaseStartedAt = timestamp;
      this.payloadOnboard = true;
      this.servo.setTarget(90);
      this.stateMachine.replace({
        kind: 'LOADING',
        targetShelf: this.currentTask?.payload.itemId ?? 'merchandise',
        step: 'ENGAGE_PAYLOAD',
        armAngle: this.servo.angle()
      });
      return;
    }

    if (this.missionPhase === 'TO_DROPOFF') {
      this.missionPhase = 'UNLOADING';
      this.phaseStartedAt = timestamp;
      this.servo.setTarget(0);
      this.stateMachine.replace({
        kind: 'UNLOADING',
        targetDock: 'dispatch',
        step: 'RELEASE_PAYLOAD',
        armAngle: this.servo.angle()
      });
      return;
    }

    if (this.missionPhase === 'TO_CHARGER') {
      this.missionPhase = 'CHARGING';
      this.phaseStartedAt = timestamp;
      this.stateMachine.replace({
        kind: 'CHARGING',
        stationId: 'nearest-charger',
        chargeLevel: this.battery.snapshot().soc,
        eta: 4
      });
      return;
    }

    this.missionPhase = 'IDLE';
    this.stateMachine.replace(idleState(timestamp));
  }

  private stepMissionActions(timestamp: number): void {
    const elapsed = timestamp - this.phaseStartedAt;

    if (this.missionPhase === 'LOADING' && elapsed > LOAD_DWELL_MS) {
      this.payloadOnboard = true;
      this.servo.setTarget(20);
      this.setSegment('TO_DROPOFF', this.dropoffPath, timestamp);
      return;
    }

    if (this.missionPhase === 'UNLOADING' && elapsed > UNLOAD_DWELL_MS) {
      this.payloadOnboard = false;
      this.servo.setTarget(0);
      this.setSegment('TO_CHARGER', this.chargerPath, timestamp);
      return;
    }

    if (this.missionPhase === 'CHARGING' && elapsed > CHARGE_DWELL_MS) {
      this.missionPhase = 'IDLE';
      this.stateMachine.replace(idleState(timestamp));
    }
  }

  private estimateEta(path: readonly Vector2[]): number {
    if (path.length < 2) {
      return 0;
    }

    let distance = 0;
    for (let index = 1; index < path.length; index += 1) {
      distance += Math.hypot(path[index].x - path[index - 1].x, path[index].y - path[index - 1].y);
    }

    return distance / Math.max(this.drive.maxLinearSpeedMps(), 0.1);
  }

  private syntheticSensors(
    timestamp: number,
    leftRPM: number,
    rightRPM: number
  ): {
    readonly ultrasonic: UltrasonicReading;
    readonly irArray: IRSensorArrayReading;
    readonly encoder: EncoderReading;
    readonly imu: IMUReading;
  } {
    const lineError = Math.sin(timestamp / 1200) * 0.45;
    return {
      ultrasonic: {
        distanceM: 1.8 + Math.sin(timestamp / 900) * 0.45,
        valid: true,
        coneHits: [{ x: this.pose.x + 1, y: this.pose.y }],
        rays: [
          { x: this.pose.x + 0.4, y: this.pose.y - 0.2 },
          { x: this.pose.x + 0.8, y: this.pose.y },
          { x: this.pose.x + 0.4, y: this.pose.y + 0.2 }
        ]
      },
      irArray: {
        readings: [0.9, 0.6, 0.2 + Math.abs(lineError), 0.6, 0.9],
        digital: [false, false, true, false, false],
        lineError,
        confidence: 0.88
      },
      encoder: {
        leftTicks: Math.round(leftRPM * timestamp * 0.0001),
        rightTicks: Math.round(rightRPM * timestamp * 0.0001),
        leftRPM,
        rightRPM
      },
      imu: {
        acceleration: { x: 0, y: 0, z: 9.80665 },
        gyroscope: { x: 0, y: 0, z: this.latestTwin?.velocity.angular ?? 0 },
        driftBias: { x: 0.001, y: 0.001, z: 0.002 }
      }
    };
  }

  private createTwin(timestamp: number, linear: number, angular: number): RobotDigitalTwin {
    const sensors = this.syntheticSensors(timestamp, 0, 0);
    return {
      id: this.id,
      timestamp,
      pose: this.pose,
      velocity: { linear, angular },
      wheels: { leftRPM: 0, rightRPM: 0, leftSlip: false, rightSlip: false },
      state: this.stateMachine.current(),
      currentTask: this.currentTask,
      path: this.path,
      eta: this.estimateEta(this.path),
      payload: this.payloadOnboard ? this.currentTask?.payload ?? null : null,
      armAngle: this.servo.angle(),
      armState: this.servo.state(),
      sensors,
      battery: this.battery.snapshot(),
      maintenance: this.maintenance.snapshot(),
      anomalies: [],
      alerts: []
    };
  }
}
