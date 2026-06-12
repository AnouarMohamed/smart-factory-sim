/**
 * Shelf inventory state and pick-point lookup service.
 */

import type { ShelfEntity, Vector2 } from '@types';

export class ShelfSystem {
  private readonly shelves: ShelfEntity[];

  public constructor(shelves: readonly ShelfEntity[]) {
    this.shelves = shelves.slice();
  }

  /** Return current shelf list. */
  public all(): readonly ShelfEntity[] {
    return this.shelves;
  }

  /** Return a shelf by id. */
  public byId(id: string): ShelfEntity | null {
    return this.shelves.find((shelf) => shelf.id === id) ?? null;
  }

  /** Return a pickup point in front of a shelf. */
  public pickPoint(id: string): Vector2 | null {
    const shelf = this.byId(id);
    return shelf ? { x: shelf.position.x - 1, y: shelf.position.y + shelf.size.y / 2 } : null;
  }
}

