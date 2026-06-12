/**
 * Deterministic simulation clock with pause and time-scale control.
 */

export class SimulationClock {
  private simTimeMs = 0;
  private timeScale: number;
  private paused = false;

  public constructor(defaultTimeScale: number) {
    this.timeScale = defaultTimeScale;
  }

  /** Advance simulated time by scaled wall-clock delta. */
  public step(wallDeltaMs: number): number {
    if (this.paused || this.timeScale === 0) {
      return 0;
    }

    const scaledDelta = wallDeltaMs * this.timeScale;
    this.simTimeMs += scaledDelta;
    return scaledDelta;
  }

  /** Set the simulation time scale. */
  public setTimeScale(nextTimeScale: number): void {
    this.timeScale = Math.max(0, nextTimeScale);
    this.paused = this.timeScale === 0;
  }

  /** Pause simulated time without losing the previous scale. */
  public pause(): void {
    this.paused = true;
  }

  /** Resume simulated time. */
  public resume(): void {
    this.paused = false;
    if (this.timeScale === 0) {
      this.timeScale = 1;
    }
  }

  /** Reset simulated time to zero. */
  public reset(): void {
    this.simTimeMs = 0;
  }

  /** Read the current simulated timestamp. */
  public now(): number {
    return this.simTimeMs;
  }

  /** Read the current time scale. */
  public getTimeScale(): number {
    return this.timeScale;
  }

  /** Return true when the clock is paused. */
  public isPaused(): boolean {
    return this.paused;
  }
}

