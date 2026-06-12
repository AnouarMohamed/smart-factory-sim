/**
 * Full robot mesh with chassis, wheels, forklift arm, sensor cone, path, and twin overlay groups.
 */

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
    const bodyLength = 0.98;
    const bodyWidth = 0.62;
    const bodyHeight = 0.24;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(bodyLength, bodyHeight, bodyWidth),
      metal.chassis()
    );
    body.position.y = 0.22;
    body.castShadow = true;
    body.receiveShadow = true;

    const topPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, 0.035, 0.42),
      new THREE.MeshStandardMaterial({ color: '#00D4FF', emissive: '#003544', roughness: 0.42 })
    );
    topPanel.position.set(-0.08, 0.365, 0);

    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.24, 3),
      new THREE.MeshStandardMaterial({ color: '#FFB300', emissive: '#3d2600', roughness: 0.5 })
    );
    nose.rotation.z = -Math.PI / 2;
    nose.rotation.y = Math.PI / 2;
    nose.position.set(0.58, 0.27, 0);

    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 20, 20),
      new THREE.MeshStandardMaterial({ color: '#00D4FF', emissive: '#00D4FF', emissiveIntensity: 1.2 })
    );
    led.position.set(-0.34, 0.43, 0);
    this.statusLed = led;

    this.wheels = [new WheelMesh(), new WheelMesh(), new WheelMesh(), new WheelMesh()];
    const wheelPositions = [
      [0.3, 0.13, 0.38],
      [0.3, 0.13, -0.38],
      [-0.3, 0.13, 0.38],
      [-0.3, 0.13, -0.38]
    ] as const;
    this.wheels.forEach((wheel, index) => {
      wheel.mesh.position.set(wheelPositions[index][0], wheelPositions[index][1], wheelPositions[index][2]);
      wheel.mesh.castShadow = true;
      this.group.add(wheel.mesh);
    });

    this.group.add(body, topPanel, nose, led, this.arm.group, this.sensorVisualization.group);
  }

  /** Update robot mesh transform and visual state from a twin snapshot. */
  public update(twin: RobotDigitalTwin, deltaSeconds: number): void {
    this.group.position.set(twin.pose.x, 0.02, twin.pose.y);
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
