/**
 * Replay control panel renderer.
 */

export class ReplayPanel {
  /** Render replay state. */
  public render(frameCount: number): string {
    return `<section class="panel mini">
      <h2>Replay</h2>
      <strong>${frameCount}</strong><span>frames</span>
    </section>`;
  }
}

