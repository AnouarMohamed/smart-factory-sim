/**
 * PID oscilloscope panel renderer for error, P, I, and D channels.
 */

import type { PIDTerms } from '@types';

export class PIDPanel {
  /** Render current PID terms as channel bars. */
  public render(terms: PIDTerms): string {
    const channels = [
      ['Error', terms.error, 'blue'],
      ['P', terms.p, 'green'],
      ['I', terms.i, 'amber'],
      ['D', terms.d, 'red']
    ] as const;

    return `<section class="panel">
      <h2>PID Scope</h2>
      <div class="scope">
        ${channels
          .map(
            ([label, value, tone]) =>
              `<div><span>${label}</span><b class="${tone}" style="width:${Math.min(100, Math.abs(value) * 40).toFixed(0)}%"></b><code>${value.toFixed(3)}</code></div>`
          )
          .join('')}
      </div>
    </section>`;
  }
}

