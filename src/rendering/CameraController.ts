/**
 * Camera mode controller for orbit, follow, top-down, and free views.
 */

import type { RobotDigitalTwin } from '@types';
import type * as THREE from 'three';

export type CameraMode = 'orbit' | 'follow' | 'top-down' | 'free';

export class CameraController {
  private mode: CameraMode = 'orbit';

  public constructor(private readonly camera: THREE.PerspectiveCamera) {}

  /** Set active camera mode. */
  public setMode(mode: CameraMode): void {
    this.mode = mode;
  }

  /** Update camera placement from mode and optional followed robot. */
  public update(followed: RobotDigitalTwin | null): void {
    if (this.mode === 'top-down') {
      this.camera.position.set(10, 18, 10);
      this.camera.lookAt(10, 0, 10);
      return;
    }

    if (this.mode === 'follow' && followed) {
      this.camera.position.set(followed.pose.x - 2.4, 2.2, followed.pose.y + 2.4);
      this.camera.lookAt(followed.pose.x, 0.2, followed.pose.y);
      return;
    }

    if (this.mode === 'orbit') {
      this.camera.position.set(10, 8, 14);
      this.camera.lookAt(10, 0, 10);
    }
  }
}

