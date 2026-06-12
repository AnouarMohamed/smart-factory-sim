/**
 * Alert panel renderer for incidents, anomalies, and emergency states.
 */

import type { Alert } from '@types';

export class AlertPanel {
  /** Render recent alerts. */
  public render(alerts: readonly Alert[]): string {
    return `<section class="panel">
      <h2>Alerts</h2>
      <div class="alert-list">
        ${
          alerts.length === 0
            ? '<p class="empty">Nominal</p>'
            : alerts
                .slice(-5)
                .reverse()
                .map((alert) => `<div class="${alert.severity.toLowerCase()}"><span>${alert.severity}</span>${alert.message}</div>`)
                .join('')
        }
      </div>
    </section>`;
  }
}

