/**
 * Time scale control model.
 */

export class TimeControl {
  private scale = 1;

  /** Set simulation speed. */
  public setScale(scale: number): void {
    this.scale = Math.max(0, scale);
  }

  /** Return simulation speed. */
  public getScale(): number {
    return this.scale;
  }
}

