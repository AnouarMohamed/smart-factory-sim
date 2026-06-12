/**
 * Edge node preprocessing panel renderer.
 */

import type { EdgeSummary } from '@iot/EdgeNode';

export class EdgeNodePanel {
  /** Render edge summaries. */
  public render(summaries: readonly EdgeSummary[]): string {
    return `<section class="panel mini">
      <h2>Edge</h2>
      <strong>${summaries.filter((summary) => summary.alert).length}</strong><span>alert summaries</span>
    </section>`;
  }
}

