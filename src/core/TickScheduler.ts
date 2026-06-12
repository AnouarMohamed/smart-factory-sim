/**
 * Multi-frequency scheduler for physics, logic, and render loops.
 */

import type { SimulationConfig } from '@config/simulation.config';
import type { SimulationTickEvent, TickChannel } from '@types';
import type { EventBus } from './EventBus';
import type { SimulationClock } from './SimulationClock';

export type TickHandler = (event: SimulationTickEvent) => void;

interface TickAccumulator {
  readonly channel: TickChannel;
  readonly stepMs: number;
  accumulatorMs: number;
  tickNumber: number;
  readonly handler: TickHandler;
}

export class TickScheduler {
  private readonly accumulators: readonly TickAccumulator[];
  private running = false;
  private frameId: number | null = null;
  private lastFrameMs: number | null = null;

  public constructor(
    private readonly eventBus: EventBus,
    private readonly clock: SimulationClock,
    private readonly config: SimulationConfig,
    handlers: {
      readonly physics: TickHandler;
      readonly logic: TickHandler;
      readonly render: TickHandler;
    }
  ) {
    this.accumulators = [
      {
        channel: 'physics',
        stepMs: 1000 / config.physicsHz,
        accumulatorMs: 0,
        tickNumber: 0,
        handler: handlers.physics
      },
      {
        channel: 'logic',
        stepMs: 1000 / config.logicHz,
        accumulatorMs: 0,
        tickNumber: 0,
        handler: handlers.logic
      },
      {
        channel: 'render',
        stepMs: 1000 / config.renderHz,
        accumulatorMs: 0,
        tickNumber: 0,
        handler: handlers.render
      }
    ];
  }

  /** Start requestAnimationFrame scheduling. */
  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastFrameMs = null;
    this.frameId = requestAnimationFrame((timestamp): void => this.frame(timestamp));
  }

  /** Stop requestAnimationFrame scheduling. */
  public stop(): void {
    this.running = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /** Manually tick every loop once for tests and deterministic stepping. */
  public tickOnce(deltaMs: number): void {
    const scaledDeltaMs = this.clock.step(deltaMs);
    for (const accumulator of this.accumulators) {
      this.runTick(accumulator, scaledDeltaMs);
    }
  }

  private frame(timestampMs: number): void {
    if (!this.running) {
      return;
    }

    const wallDeltaMs = this.lastFrameMs === null ? 0 : timestampMs - this.lastFrameMs;
    this.lastFrameMs = timestampMs;
    const scaledDeltaMs = this.clock.step(wallDeltaMs);

    for (const accumulator of this.accumulators) {
      accumulator.accumulatorMs += scaledDeltaMs;
      let catchupSteps = 0;
      while (
        accumulator.accumulatorMs >= accumulator.stepMs &&
        catchupSteps < this.config.maxPhysicsCatchupSteps
      ) {
        this.runTick(accumulator, accumulator.stepMs);
        accumulator.accumulatorMs -= accumulator.stepMs;
        catchupSteps += 1;
      }
    }

    this.frameId = requestAnimationFrame((nextTimestamp): void => this.frame(nextTimestamp));
  }

  private runTick(accumulator: TickAccumulator, deltaMs: number): void {
    accumulator.tickNumber += 1;
    const event: SimulationTickEvent = {
      channel: accumulator.channel,
      tickNumber: accumulator.tickNumber,
      deltaMs,
      simTimeMs: this.clock.now()
    };
    accumulator.handler(event);
    this.eventBus.emit('simulation:tick', event);
  }
}

