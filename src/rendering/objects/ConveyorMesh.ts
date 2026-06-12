/**
 * Conveyor belt mesh with scrolling phase support.
 */

import type { ConveyorEntity } from '@types';
import * as THREE from 'three';

export class ConveyorMesh {
  public readonly group = new THREE.Group();
  private readonly belt: THREE.Mesh;

  public constructor(conveyor: ConveyorEntity) {
    const length = Math.hypot(conveyor.end.x - conveyor.start.x, conveyor.end.y - conveyor.start.y);
    this.belt = new THREE.Mesh(
      new THREE.BoxGeometry(length, 0.08, 0.42),
      new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.5, metalness: 0.2 })
    );
    this.belt.position.set((conveyor.start.x + conveyor.end.x) / 2, 0.05, (conveyor.start.y + conveyor.end.y) / 2);
    this.belt.rotation.y = -Math.atan2(conveyor.end.y - conveyor.start.y, conveyor.end.x - conveyor.start.x);
    this.group.add(this.belt);
  }

  /** Update belt material emissive phase. */
  public setPhase(phase: number): void {
    const material = this.belt.material;
    if (material instanceof THREE.MeshStandardMaterial) {
      material.emissive.setRGB(0, phase * 0.05, phase * 0.08);
    }
  }
}

