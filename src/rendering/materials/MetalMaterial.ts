/**
 * PBR metal and chassis material helpers.
 */

import * as THREE from 'three';

export class MetalMaterial {
  /** Create brushed shelf metal material. */
  public shelf(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8B9BB4'),
      roughness: 0.38,
      metalness: 0.75
    });
  }

  /** Create matte robot chassis material. */
  public chassis(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2A3040'),
      roughness: 0.58,
      metalness: 0.35
    });
  }
}

