/**
 * Transparent floor heatmap overlay.
 */

import * as THREE from 'three';

export class HeatmapVisualization {
  public readonly mesh: THREE.Mesh;

  public constructor(width: number, height: number) {
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color: '#00FF88', transparent: true, opacity: 0.08, depthWrite: false })
    );
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.set(width / 2, 0.012, height / 2);
  }
}

