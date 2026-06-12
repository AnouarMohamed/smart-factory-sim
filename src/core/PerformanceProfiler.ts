/**
 * Sliding-window profiler for frame, tick, pathfinding, and MQTT metrics.
 */

export interface ProfilerSnapshot {
  readonly fps: number;
  readonly physicsMs: number;
  readonly logicMs: number;
  readonly renderMs: number;
  readonly pathfindingMs: number;
  readonly mqttMessagesPerSecond: number;
}

type MetricName = 'physics' | 'logic' | 'render' | 'pathfinding';

interface MetricSample {
  readonly timestamp: number;
  readonly value: number;
}

export class PerformanceProfiler {
  private readonly samples = new Map<MetricName, MetricSample[]>();
  private readonly mqttTimestamps: number[] = [];
  private frameCount = 0;
  private frameWindowStartedAt = performance.now();

  public constructor(private readonly windowMs: number) {
    this.samples.set('physics', []);
    this.samples.set('logic', []);
    this.samples.set('render', []);
    this.samples.set('pathfinding', []);
  }

  /** Record a timed metric sample. */
  public record(metric: MetricName, valueMs: number): void {
    const now = performance.now();
    const samples = this.samples.get(metric);
    if (!samples) {
      return;
    }

    samples.push({ timestamp: now, value: valueMs });
    this.trim(samples, now);
  }

  /** Record one rendered frame for FPS calculation. */
  public recordFrame(): void {
    this.frameCount += 1;
  }

  /** Record one MQTT message for throughput calculation. */
  public recordMqttMessage(): void {
    const now = performance.now();
    this.mqttTimestamps.push(now);
    while (this.mqttTimestamps.length > 0 && now - this.mqttTimestamps[0] > this.windowMs) {
      this.mqttTimestamps.shift();
    }
  }

  /** Return the current profiler aggregate. */
  public snapshot(): ProfilerSnapshot {
    const now = performance.now();
    const elapsedSeconds = Math.max((now - this.frameWindowStartedAt) / 1000, 0.001);
    const fps = this.frameCount / elapsedSeconds;

    if (elapsedSeconds > 1) {
      this.frameCount = 0;
      this.frameWindowStartedAt = now;
    }

    return {
      fps,
      physicsMs: this.average('physics'),
      logicMs: this.average('logic'),
      renderMs: this.average('render'),
      pathfindingMs: this.average('pathfinding'),
      mqttMessagesPerSecond: this.mqttTimestamps.length / Math.max(this.windowMs / 1000, 0.001)
    };
  }

  private average(metric: MetricName): number {
    const samples = this.samples.get(metric) ?? [];
    if (samples.length === 0) {
      return 0;
    }

    const total = samples.reduce((sum, sample) => sum + sample.value, 0);
    return total / samples.length;
  }

  private trim(samples: MetricSample[], now: number): void {
    while (samples.length > 0 && now - samples[0].timestamp > this.windowMs) {
      samples.shift();
    }
  }
}

