/**
 * Camera control model for dashboard command surface.
 */

import type { CameraMode } from '@rendering/CameraController';

export class CameraControls {
  private mode: CameraMode = 'orbit';

  /** Set camera mode. */
  public setMode(mode: CameraMode): void {
    this.mode = mode;
  }

  /** Return camera mode. */
  public getMode(): CameraMode {
    return this.mode;
  }
}

