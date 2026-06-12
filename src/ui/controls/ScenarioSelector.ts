/**
 * Scenario selection model.
 */

export class ScenarioSelector {
  private activeScenarioId = 'small-warehouse';

  /** Set the active scenario id. */
  public select(id: string): void {
    this.activeScenarioId = id;
  }

  /** Return the active scenario id. */
  public active(): string {
    return this.activeScenarioId;
  }
}

