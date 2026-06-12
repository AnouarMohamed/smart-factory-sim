/**
 * Worker marker mesh with safety bubble visualization.
 */

import type { WorkerEntity } from '@types';
import * as THREE from 'three';

export class WorkerMesh {
  public readonly group = new THREE.Group();
  private readonly body: THREE.Mesh;

  public constructor(worker: WorkerEntity) {
    this.body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, 0.22, 4, 12),
      new THREE.MeshStandardMaterial({ color: '#FFB300', roughness: 0.7 })
    );
    this.body.position.y = 0.22;
    const bubble = new THREE.Mesh(
      new THREE.CircleGeometry(worker.safetyBubbleM, 48),
      new THREE.MeshBasicMaterial({ color: '#FFB300', transparent: true, opacity: 0.08, depthWrite: false })
    );
    bubble.rotation.x = -Math.PI / 2;
    this.group.add(bubble, this.body);
    this.update(worker);
  }

  /** Update worker transform. */
  public update(worker: WorkerEntity): void {
    this.group.position.set(worker.position.x, 0.02, worker.position.y);
  }
}

