/**
 * Observable authoritative robot-state store for rendering, MQTT, UI, and replay.
 */

import type { EventBus } from '@core/EventBus';
import type { RobotDigitalTwin } from '@types';

export class DigitalTwin {
  private readonly robots = new Map<string, RobotDigitalTwin>();

  public constructor(private readonly eventBus: EventBus) {}

  /** Set the full robot twin snapshot and emit a typed update. */
  public setRobot(twin: RobotDigitalTwin): void {
    this.robots.set(twin.id, twin);
    this.eventBus.emit('robot:twin-updated', { robotId: twin.id, twin });
  }

  /** Read one robot twin snapshot. */
  public getRobot(robotId: string): RobotDigitalTwin | null {
    return this.robots.get(robotId) ?? null;
  }

  /** Return all robot twin snapshots. */
  public allRobots(): readonly RobotDigitalTwin[] {
    return Array.from(this.robots.values());
  }
}

