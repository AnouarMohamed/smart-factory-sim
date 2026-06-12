/** Fleet task assignment, reservation, conflict, and metrics contracts. */

import type { Vector2 } from './physics.types';
import type { Task, TaskPriority } from './robot.types';

export interface FleetTask extends Task {
  readonly assignedRobotId: string | null;
  readonly status: 'QUEUED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
}

export interface TaskAssignment {
  readonly taskId: string;
  readonly robotId: string;
  readonly score: number;
  readonly reason: string;
}

export interface CellReservation {
  readonly robotId: string;
  readonly cell: Vector2;
  readonly entersAtMs: number;
  readonly leavesAtMs: number;
}

export interface FleetConflict {
  readonly id: string;
  readonly robotIds: readonly string[];
  readonly cell: Vector2;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly detectedAtMs: number;
}

export interface ConflictResolution {
  readonly conflictId: string;
  readonly winnerRobotId: string;
  readonly waitingRobotIds: readonly string[];
  readonly reason: string;
}

export interface PriorityWeight {
  readonly priority: TaskPriority;
  readonly weight: number;
}

export interface FleetMetrics {
  readonly activeRobots: number;
  readonly queuedTasks: number;
  readonly completedTasks: number;
  readonly conflictsResolved: number;
  readonly averageBatterySoc: number;
}

