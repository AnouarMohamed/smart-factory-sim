/**
 * Weighted occupancy grid built from scenario data and fleet reservations.
 */

import type { CellReservation, GridCell, ScenarioDefinition, Vector2 } from '@types';

const DIRECTIONS: readonly Vector2[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: -1 }
];

export class NavGrid {
  private readonly cells: GridCell[];
  private readonly reservations = new Map<string, CellReservation>();

  public constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly tileSizeM: number,
    cells?: readonly GridCell[]
  ) {
    this.cells =
      cells?.slice() ??
      Array.from({ length: width * height }, (_, index): GridCell => ({
        x: index % width,
        y: Math.floor(index / width),
        blocked: false,
        baseCost: 1,
        zoneId: null
      }));
  }

  /** Build a navigation grid from a scenario definition. */
  public static fromScenario(scenario: ScenarioDefinition): NavGrid {
    const grid = new NavGrid(scenario.grid.width, scenario.grid.height, scenario.grid.tileSizeM);

    for (const shelf of scenario.shelves) {
      grid.markBlockedRect(shelf.position, shelf.size, shelf.id);
    }

    for (const zone of scenario.zones) {
      for (const cell of zone.cells) {
        grid.setCell({
          x: cell.x,
          y: cell.y,
          blocked: zone.type === 'NO_GO' || zone.type === 'HAZARD',
          baseCost: zone.costMultiplier,
          zoneId: zone.id
        });
      }
    }

    for (const hazard of scenario.hazards) {
      for (const cell of hazard.zone.cells) {
        grid.setCell({
          x: cell.x,
          y: cell.y,
          blocked: true,
          baseCost: 999,
          zoneId: hazard.zone.id
        });
      }
    }

    return grid;
  }

  /** Return a cell at integer coordinates. */
  public cellAt(point: Vector2): GridCell | null {
    const x = Math.round(point.x);
    const y = Math.round(point.y);
    if (!this.inBounds(x, y)) {
      return null;
    }

    return this.cells[this.index(x, y)];
  }

  /** Return walkable neighbor cells with diagonal movement. */
  public neighbors(cell: GridCell): readonly GridCell[] {
    return DIRECTIONS.map((direction) => this.cellAt({ x: cell.x + direction.x, y: cell.y + direction.y }))
      .filter((candidate): candidate is GridCell => candidate !== null)
      .filter((candidate) => !candidate.blocked);
  }

  /** Return movement cost for entering a cell. */
  public cost(cell: GridCell): number {
    const reservation = this.reservations.get(this.key(cell));
    const reservationPenalty = reservation ? 4 : 0;
    return cell.baseCost + reservationPenalty;
  }

  /** Reserve a cell for a robot and time window. */
  public reserve(reservation: CellReservation): void {
    this.reservations.set(this.key(reservation.cell), reservation);
  }

  /** Clear all reservations, or only reservations for one robot. */
  public clearReservations(robotId?: string): void {
    if (!robotId) {
      this.reservations.clear();
      return;
    }

    for (const [key, reservation] of this.reservations.entries()) {
      if (reservation.robotId === robotId) {
        this.reservations.delete(key);
      }
    }
  }

  /** Return a stable cell key. */
  public key(point: Vector2): string {
    return `${Math.round(point.x)},${Math.round(point.y)}`;
  }

  /** Return all cells in row-major order. */
  public allCells(): readonly GridCell[] {
    return this.cells;
  }

  private markBlockedRect(position: Vector2, size: Vector2, zoneId: string): void {
    const maxX = Math.ceil(position.x + size.x);
    const maxY = Math.ceil(position.y + size.y);
    for (let y = Math.floor(position.y); y < maxY; y += 1) {
      for (let x = Math.floor(position.x); x < maxX; x += 1) {
        this.setCell({ x, y, blocked: true, baseCost: 999, zoneId });
      }
    }
  }

  private setCell(cell: GridCell): void {
    if (!this.inBounds(cell.x, cell.y)) {
      return;
    }

    this.cells[this.index(cell.x, cell.y)] = cell;
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  private index(x: number, y: number): number {
    return y * this.width + x;
  }
}

