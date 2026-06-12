/**
 * Warning material helpers for no-go and hazard zones.
 */

import * as THREE from 'three';

export class HazardMaterial {
  /** Create translucent amber hazard material. */
  public create(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFB300'),
      emissive: new THREE.Color('#4a2f00'),
      transparent: true,
      opacity: 0.38,
      roughness: 0.4
    });
  }
}

