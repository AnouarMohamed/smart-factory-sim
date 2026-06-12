/**
 * Time-of-day color and light intensity model.
 */

import * as THREE from 'three';

export class DayNightCycle {
  /** Apply simulated hour lighting to scene and sun. */
  public apply(scene: THREE.Scene, sun: THREE.DirectionalLight, hour: number): void {
    const normalized = ((hour % 24) + 24) % 24;
    const night = normalized >= 22 || normalized < 6;
    scene.background = new THREE.Color(night ? '#050814' : '#111827');
    sun.intensity = night ? 0.35 : 2.2;
    sun.color.set(night ? '#8fb3ff' : '#f5f7ff');
  }
}

