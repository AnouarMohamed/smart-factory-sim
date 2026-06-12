/**
 * Detects simple circular waits and proposes a robot to back out.
 */

export interface WaitEdge {
  readonly robotId: string;
  readonly waitingForRobotId: string;
}

export interface DeadlockResolutionPlan {
  readonly deadlocked: boolean;
  readonly robotToReroute: string | null;
  readonly reason: string;
}

export class DeadlockResolver {
  /** Detect a two-robot or longer circular wait. */
  public resolve(edges: readonly WaitEdge[]): DeadlockResolutionPlan {
    for (const edge of edges) {
      const cycle = this.findCycle(edge.robotId, edge.waitingForRobotId, edges, new Set<string>());
      if (cycle) {
        return {
          deadlocked: true,
          robotToReroute: edge.robotId,
          reason: `Circular wait detected at ${edge.robotId}`
        };
      }
    }

    return {
      deadlocked: false,
      robotToReroute: null,
      reason: 'No circular waits detected'
    };
  }

  private findCycle(
    origin: string,
    current: string,
    edges: readonly WaitEdge[],
    visited: Set<string>
  ): boolean {
    if (current === origin) {
      return true;
    }

    if (visited.has(current)) {
      return false;
    }

    visited.add(current);
    return edges
      .filter((edge) => edge.robotId === current)
      .some((edge) => this.findCycle(origin, edge.waitingForRobotId, edges, visited));
  }
}

