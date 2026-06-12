/**
 * Central fleet orchestrator for tasks, route reservations, conflicts, and metrics.
 */

import type { EventBus } from '@core/EventBus';
import type { FleetMetrics, FleetTask, RobotDigitalTwin, Task } from '@types';
import { ConflictResolver } from './ConflictResolver';
import { FleetTelemetry } from './FleetTelemetry';
import { TaskAssigner } from './TaskAssigner';
import { TaskQueue } from './TaskQueue';

export class FleetManager {
  private readonly queue = new TaskQueue();
  private readonly assigner = new TaskAssigner();
  private readonly conflicts = new ConflictResolver();
  private readonly telemetry = new FleetTelemetry();

  public constructor(private readonly eventBus: EventBus) {}

  /** Add a task into the fleet task queue. */
  public enqueue(task: Task): FleetTask {
    return this.queue.enqueue(task);
  }

  /** Run assignment, conflict detection, and metrics aggregation. */
  public step(robots: readonly RobotDigitalTwin[], timestamp: number): FleetMetrics {
    const nextTask = this.queue.peek();
    if (nextTask) {
      const assignment = this.assigner.assign(nextTask.id, nextTask.pickup, robots);
      if (assignment) {
        this.queue.assign(nextTask.id, assignment.robotId);
        this.eventBus.emit('fleet:task-assigned', assignment);
      }
    }

    const conflict = this.conflicts.detect(robots, timestamp);
    if (conflict) {
      this.eventBus.emit('fleet:conflict-detected', conflict);
      const resolution = this.conflicts.resolve(conflict, robots);
      this.eventBus.emit('fleet:deadlock-resolved', {
        robotIds: resolution.waitingRobotIds,
        resolution: resolution.reason
      });
    }

    const metrics = this.telemetry.aggregate(robots, this.queue.all());
    this.eventBus.emit('fleet:metrics', metrics);
    return metrics;
  }

  /** Return all tasks. */
  public tasks(): readonly FleetTask[] {
    return this.queue.all();
  }
}

