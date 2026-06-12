/**
 * Cloud connector panel renderer.
 */

export class CloudPanel {
  /** Render cloud ingestion count. */
  public render(count: number): string {
    return `<section class="panel mini">
      <h2>Cloud</h2>
      <strong>${count}</strong><span>messages</span>
    </section>`;
  }
}

