/**
 * Replay frame reader with timestamp lookup and scrub support.
 */

import type { ReplayFrame } from '@types';

export class ReplayPlayer {
  private frameIndex = 0;

  public constructor(private readonly frames: readonly ReplayFrame[]) {}

  /** Return the current replay frame, if one exists. */
  public current(): ReplayFrame | null {
    return this.frames[this.frameIndex] ?? null;
  }

  /** Move replay cursor to the first frame at or after timestamp. */
  public seek(timestamp: number): ReplayFrame | null {
    const nextIndex = this.frames.findIndex((frame) => frame.timestamp >= timestamp);
    this.frameIndex = nextIndex === -1 ? Math.max(0, this.frames.length - 1) : nextIndex;
    return this.current();
  }

  /** Advance replay cursor by one frame. */
  public next(): ReplayFrame | null {
    this.frameIndex = Math.min(this.frameIndex + 1, Math.max(0, this.frames.length - 1));
    return this.current();
  }
}

