/**
 * Sensor cone, IR dots, and ultrasonic ray visualization.
 */

import type { RobotDigitalTwin } from '@types';
import * as THREE from 'three';

export class SensorVisualization {
  public readonly group = new THREE.Group();
  private readonly cone: THREE.Mesh;

  public constructor() {
    const geometry = new THREE.ConeGeometry(0.55, 1.6, 32, 1, true);
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0.78, 0, 0);
    this.cone = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: '#00D4FF', transparent: true, opacity: 0.12, depthWrite: false })
    );
    this.group.add(this.cone);
  }

  /** Update cone color from ultrasonic proximity. */
  public update(twin: RobotDigitalTwin): void {
    const material = this.cone.material;
    if (material instanceof THREE.MeshBasicMaterial) {
      const distance = twin.sensors.ultrasonic.distanceM;
      material.color.set(distance < 0.6 ? '#FF3B30' : distance < 1.2 ? '#FFB300' : '#00D4FF');
      material.opacity = distance < 0.6 ? 0.24 : 0.12;
    }
  }
}

