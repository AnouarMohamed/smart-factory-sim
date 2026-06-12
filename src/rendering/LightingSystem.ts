/**
 * Factory ambient, sun, and ceiling lighting setup.
 */

import * as THREE from 'three';

export class LightingSystem {
  public readonly sun = new THREE.DirectionalLight('#f5f7ff', 2.2);

  /** Add lights to a scene. */
  public mount(scene: THREE.Scene, width: number, height: number): void {
    scene.add(new THREE.AmbientLight('#8bb9ff', 0.45));
    this.sun.position.set(width * 0.4, 10, height * 0.3);
    this.sun.castShadow = true;
    scene.add(this.sun);

    for (let x = 3; x < width; x += 6) {
      for (let z = 3; z < height; z += 6) {
        const light = new THREE.PointLight('#d7ecff', 0.8, 7);
        light.position.set(x, 3.4, z);
        scene.add(light);
      }
    }
  }
}

