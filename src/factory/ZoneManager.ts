/**
 * Zone lookup for restricted areas, hazards, and priority corridors.
 */

import type { GridZone, Vector2 } from '@types';

export class ZoneManager {
  public constructor(private readonly zones: readonly GridZone[]) {}

  /** Return zones containing a grid cell. */
  public zonesAt(cell: Vector2): readonly GridZone[] {
    return this.zones.filter((zone) =>
      zone.cells.some((zoneCell) => zoneCell.x === Math.round(cell.x) && zoneCell.y === Math.round(cell.y))
    );
  }

  /** Return all configured zones. */
  public all(): readonly GridZone[] {
    return this.zones;
  }
}

