/**
 * Profiler panel renderer for FPS, tick time, pathfinding, and MQTT throughput.
 */

import type { ProfilerSnapshot } from '@core/PerformanceProfiler';

export class ProfilerPanel {
  /** Render profiler metrics. */
  public render(snapshot: ProfilerSnapshot): string {
    return `<section class="panel">
      <h2>Profiler</h2>
      <div class="metric-grid compact">
        <div><span>FPS</span><strong>${snapshot.fps.toFixed(0)}</strong></div>
        <div><span>Physics</span><strong>${snapshot.physicsMs.toFixed(2)} ms</strong></div>
        <div><span>Logic</span><strong>${snapshot.logicMs.toFixed(2)} ms</strong></div>
        <div><span>MQTT</span><strong>${snapshot.mqttMessagesPerSecond.toFixed(1)}/s</strong></div>
      </div>
    </section>`;
  }
}

