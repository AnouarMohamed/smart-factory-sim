/**
 * Factory world aggregate built from scenario configuration.
 */

import type { EventBus } from '@core/EventBus';
import type { ScenarioDefinition, Vector2, WorkerEntity } from '@types';
import { ConveyorBelt } from './ConveyorBelt';
import { FactoryGrid } from './FactoryGrid';
import { HazardSystem } from './HazardSystem';
import { InventorySystem } from './InventorySystem';
import { ShelfSystem } from './ShelfSystem';
import { ShiftScheduler } from './ShiftScheduler';
import { WorkerSpawner } from './WorkerSpawner';
import { ZoneManager } from './ZoneManager';

export class FactoryWorld {
  public readonly grid: FactoryGrid;
  public readonly shelves: ShelfSystem;
  public readonly inventory: InventorySystem;
  public readonly zones: ZoneManager;
  public readonly hazards: HazardSystem;
  public readonly shifts = new ShiftScheduler();
  private readonly conveyors: readonly ConveyorBelt[];
  private readonly workers: WorkerSpawner;
  private currentWorkers: readonly WorkerEntity[];

  public constructor(
    public readonly scenario: ScenarioDefinition,
    eventBus: EventBus
  ) {
    this.grid = new FactoryGrid(scenario);
    this.shelves = new ShelfSystem(scenario.shelves);
    this.inventory = new InventorySystem(scenario.shelves);
    this.zones = new ZoneManager(scenario.zones);
    this.hazards = new HazardSystem(scenario.hazards, eventBus);
    this.conveyors = scenario.conveyors.map((conveyor) => new ConveyorBelt(conveyor));
    this.workers = new WorkerSpawner(scenario.workers);
    this.currentWorkers = scenario.workers;
  }

  /** Advance factory systems by elapsed seconds. */
  public step(deltaSeconds: number): void {
    this.currentWorkers = this.workers.step(deltaSeconds);
    for (const conveyor of this.conveyors) {
      conveyor.step(deltaSeconds);
    }
  }

  /** Return all worker snapshots. */
  public workerSnapshots(): readonly WorkerEntity[] {
    return this.currentWorkers;
  }

  /** Return obstacle points used by simple sensor checks. */
  public obstaclePoints(): readonly Vector2[] {
    return [
      ...this.scenario.shelves.map((shelf) => shelf.position),
      ...this.currentWorkers.map((worker) => worker.position),
      ...this.scenario.hazards.flatMap((hazard) => hazard.zone.cells)
    ];
  }
}

