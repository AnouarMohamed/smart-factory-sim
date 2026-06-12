/**
 * Structured event recorder for simulation replay frames.
 */

import type { MQTTMessage, ReplayFrame, RobotDigitalTwin } from '@types';

export class ReplayRecorder {
  private readonly frames: ReplayFrame[] = [];
  private readonly pendingMessages: MQTTMessage[] = [];

  /** Append an MQTT message to the next replay frame. */
  public recordMessage(message: MQTTMessage): void {
    this.pendingMessages.push(message);
  }

  /** Capture current twin snapshots into the replay timeline. */
  public captureFrame(timestamp: number, twins: readonly RobotDigitalTwin[]): ReplayFrame {
    const frame: ReplayFrame = {
      index: this.frames.length,
      timestamp,
      twins: twins.map((twin) => ({ ...twin })),
      mqttMessages: [...this.pendingMessages]
    };
    this.frames.push(frame);
    this.pendingMessages.length = 0;
    return frame;
  }

  /** Read immutable replay frames. */
  public getFrames(): readonly ReplayFrame[] {
    return this.frames;
  }

  /** Remove all captured frames and pending messages. */
  public clear(): void {
    this.frames.length = 0;
    this.pendingMessages.length = 0;
  }
}

