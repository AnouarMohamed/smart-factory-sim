/**
 * Priority task queue ordered CRITICAL, HIGH, NORMAL, LOW.
 */

import type { FleetTask, Task, TaskPriority } from '@types';

const PRIORITY_ORDER: Readonly<Record<TaskPriority, number>> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3
};

export class TaskQueue {
  private readonly tasks: FleetTask[] = [];

  /** Add a new task to the queue. */
  public enqueue(task: Task): FleetTask {
    const fleetTask: FleetTask = {
      ...task,
      assignedRobotId: null,
      status: 'QUEUED'
    };
    this.tasks.push(fleetTask);
    this.sort();
    return fleetTask;
  }

  /** Return the next queued task without removing it. */
  public peek(): FleetTask | null {
    return this.tasks.find((task) => task.status === 'QUEUED') ?? null;
  }

  /** Mark a task as active for a robot. */
  public assign(taskId: string, robotId: string): FleetTask | null {
    const task = this.tasks.find((candidate) => candidate.id === taskId);
    if (!task) {
      return null;
    }

    const updated: FleetTask = { ...task, assignedRobotId: robotId, status: 'ACTIVE' };
    this.replace(updated);
    return updated;
  }

  /** Mark a task as completed. */
  public complete(taskId: string): FleetTask | null {
    const task = this.tasks.find((candidate) => candidate.id === taskId);
    if (!task) {
      return null;
    }

    const updated: FleetTask = { ...task, status: 'COMPLETED' };
    this.replace(updated);
    return updated;
  }

  /** Return all tasks. */
  public all(): readonly FleetTask[] {
    return this.tasks;
  }

  private replace(task: FleetTask): void {
    const index = this.tasks.findIndex((candidate) => candidate.id === task.id);
    if (index >= 0) {
      this.tasks[index] = task;
    }
  }

  private sort(): void {
    this.tasks.sort(
      (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.createdAtMs - b.createdAtMs
    );
  }
}

