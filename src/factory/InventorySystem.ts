/**
 * Global shelf inventory tracking and reorder trigger helper.
 */

import type { ShelfEntity } from '@types';

export class InventorySystem {
  private readonly stock = new Map<string, ShelfEntity>();

  public constructor(shelves: readonly ShelfEntity[]) {
    for (const shelf of shelves) {
      this.stock.set(shelf.id, shelf);
    }
  }

  /** Adjust shelf stock level and return the new shelf state. */
  public setStockLevel(shelfId: string, stockLevel: number): ShelfEntity | null {
    const shelf = this.stock.get(shelfId);
    if (!shelf) {
      return null;
    }

    const updated = { ...shelf, stockLevel: Math.max(0, Math.min(shelf.capacity, stockLevel)) };
    this.stock.set(shelfId, updated);
    return updated;
  }

  /** Return all shelf inventory snapshots. */
  public all(): readonly ShelfEntity[] {
    return Array.from(this.stock.values());
  }
}

