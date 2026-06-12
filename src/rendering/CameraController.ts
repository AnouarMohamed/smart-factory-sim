/**
 * Camera mode controller for orbit, follow, top-down, and free views.
 */

import type { RobotDigitalTwin } from '@types';
import type * as THREE from 'three';

export type CameraMode = 'orbit' | 'follow' | 'top-down' | 'free';

export class CameraController {
  private mode: CameraMode = 'follow';

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
      const compact = this.camera.aspect < 0.75;
      const followDistance = compact ? 7.2 : 4.8;
      const height = compact ? 5.8 : 4.2;
      const sideOffset = compact ? -2.1 : -1.4;
      const forwardOffset = compact ? 4.8 : 3.2;
      const lookAhead = compact ? 3.0 : 1.6;
      const behindX = followed.pose.x - Math.cos(followed.pose.theta) * followDistance;
      const behindZ = followed.pose.y - Math.sin(followed.pose.theta) * followDistance;
      this.camera.position.set(behindX + sideOffset, height, behindZ + forwardOffset);
      this.camera.lookAt(followed.pose.x + lookAhead, 0.35, followed.pose.y);
      return;
    }

    if (this.mode === 'orbit') {
      this.camera.position.set(8, 7, 11);
      this.camera.lookAt(8, 0, 8);
    }
  }
}
