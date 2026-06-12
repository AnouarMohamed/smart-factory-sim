/**
 * Worker lifecycle manager for scenario and shift-driven density changes.
 */

import type { WorkerEntity } from '@types';
import { WorkerAgent } from './WorkerAgent';

export class WorkerSpawner {
  private readonly workers: WorkerAgent[];

  public constructor(workers: readonly WorkerEntity[]) {
    this.workers = workers.map((worker) => new WorkerAgent(worker));
  }

  /** Advance all workers. */
  public step(deltaSeconds: number): readonly WorkerEntity[] {
    return this.workers.map((worker) => worker.step(deltaSeconds));
  }

  /** Return worker agents for proximity checks. */
  public agents(): readonly WorkerAgent[] {
    return this.workers;
  }
}

