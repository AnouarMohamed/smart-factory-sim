/**
 * Loading dock queue and handoff state.
 */

import type { LoadingDockEntity } from '@types';

export class LoadingDock {
  private entity: LoadingDockEntity;

  public constructor(entity: LoadingDockEntity) {
    this.entity = entity;
  }

  /** Set the dock status. */
  public setStatus(status: LoadingDockEntity['status']): void {
    this.entity = { ...this.entity, status };
  }

  /** Return dock state. */
  public snapshot(): LoadingDockEntity {
    return this.entity;
  }
}

