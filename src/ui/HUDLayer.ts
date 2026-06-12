/**
 * Heads-up display metric model for key simulation values.
 */

import type { HUDMetric } from '@types';

export class HUDLayer {
  private metrics: readonly HUDMetric[] = [];

  /** Replace HUD metrics. */
  public setMetrics(metrics: readonly HUDMetric[]): void {
    this.metrics = metrics;
  }

  /** Render HUD metrics. */
  public render(): string {
    return `<div class="hud">${this.metrics
      .map((metric) => `<div class="${metric.tone}"><span>${metric.label}</span><strong>${metric.value}</strong></div>`)
      .join('')}</div>`;
  }
}

