/**
 * Full robot mesh with chassis, wheels, forklift arm, sensor cone, path, and twin overlay groups.
 */

import { ROBOT_CONFIG } from '@config/robot.config';
import type { RobotDigitalTwin } from '@types';
import * as THREE from 'three';
import { MetalMaterial } from '../materials/MetalMaterial';
import { ForkliftArmMesh } from './ForkliftArmMesh';
import { SensorVisualization } from './SensorVisualization';
import { WheelMesh } from './WheelMesh';

export class RobotMesh {
  public readonly group = new THREE.Group();
  private readonly wheels: readonly WheelMesh[];
  private readonly arm = new ForkliftArmMesh();
  private readonly statusLed: THREE.Mesh;
  private readonly sensorVisualization = new SensorVisualization();

  public constructor(public readonly robotId: string) {
    const metal = new MetalMaterial();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(ROBOT_CONFIG.body.lengthM, ROBOT_CONFIG.body.widthM, ROBOT_CONFIG.body.heightM),
      metal.chassis()
    );
    body.position.z = ROBOT_CONFIG.body.heightM / 2;

    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#00D4FF', emissive: '#00D4FF', emissiveIntensity: 1.2 })
    );
    led.position.set(0.03, 0, ROBOT_CONFIG.body.heightM + 0.025);
    this.statusLed = led;

    this.wheels = [new WheelMesh(), new WheelMesh(), new WheelMesh(), new WheelMesh()];
    const wheelPositions = [
      [0.1, 0.13, 0.04],
      [0.1, -0.13, 0.04],
      [-0.1, 0.13, 0.04],
      [-0.1, -0.13, 0.04]
    ] as const;
    this.wheels.forEach((wheel, index) => {
      wheel.mesh.position.set(wheelPositions[index][0], wheelPositions[index][1], wheelPositions[index][2]);
      this.group.add(wheel.mesh);
    });

    this.group.add(body, led, this.arm.group, this.sensorVisualization.group);
  }

  /** Update robot mesh transform and visual state from a twin snapshot. */
  public update(twin: RobotDigitalTwin, deltaSeconds: number): void {
    this.group.position.set(twin.pose.x, 0.05, twin.pose.y);
    this.group.rotation.y = -twin.pose.theta;
    this.arm.setAngle(twin.armAngle);
    this.wheels[0].spin(twin.wheels.leftRPM, deltaSeconds);
    this.wheels[2].spin(twin.wheels.leftRPM, deltaSeconds);
    this.wheels[1].spin(twin.wheels.rightRPM, deltaSeconds);
    this.wheels[3].spin(twin.wheels.rightRPM, deltaSeconds);
    this.sensorVisualization.update(twin);
    this.setLed(twin.state.kind);
  }

  private setLed(state: RobotDigitalTwin['state']['kind']): void {
    const color = state === 'IDLE' ? '#00FF88' : state === 'OBSTACLE_BLOCKED' ? '#FFB300' : state === 'ERROR' || state === 'EMERGENCY_STOP' ? '#FF3B30' : '#00D4FF';
    const material = this.statusLed.material;
    if (material instanceof THREE.MeshStandardMaterial) {
      material.color.set(color);
      material.emissive.set(color);
    }
  }
}

