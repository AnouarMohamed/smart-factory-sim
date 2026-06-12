/**
 * Inventory panel renderer for shelf stock levels.
 */

import type { ShelfEntity } from '@types';

export class InventoryPanel {
  /** Render shelf stock levels. */
  public render(shelves: readonly ShelfEntity[]): string {
    return `<section class="panel">
      <h2>Inventory</h2>
      <div class="stock-list">
        ${shelves
          .slice(0, 6)
          .map(
            (shelf) =>
              `<div><span>${shelf.id}</span><meter min="0" max="${shelf.capacity}" value="${shelf.stockLevel}"></meter><strong>${shelf.stockLevel}/${shelf.capacity}</strong></div>`
          )
          .join('')}
      </div>
    </section>`;
  }
}

