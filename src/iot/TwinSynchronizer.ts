/**
 * Synchronizes robot controller snapshots into the digital twin store.
 */

import type { RobotDigitalTwin } from '@types';
import type { DigitalTwin } from './DigitalTwin';

export class TwinSynchronizer {
  public constructor(private readonly digitalTwin: DigitalTwin) {}

  /** Write a robot snapshot into the authoritative twin. */
  public sync(twin: RobotDigitalTwin): void {
    this.digitalTwin.setRobot(twin);
  }
}

