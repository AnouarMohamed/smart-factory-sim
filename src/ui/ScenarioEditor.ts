/**
 * Scenario editor validation and serialization model.
 */

import type { ScenarioDefinition } from '@types';

export class ScenarioEditor {
  /** Validate a scenario for essential factory entities. */
  public validate(scenario: ScenarioDefinition): readonly string[] {
    const errors: string[] = [];
    if (scenario.chargers.length === 0) {
      errors.push('At least one charging station is required.');
    }
    if (scenario.docks.length === 0) {
      errors.push('At least one loading dock is required.');
    }
    if (scenario.robots.length === 0) {
      errors.push('At least one robot is required.');
    }
    return errors;
  }

  /** Serialize a scenario as formatted JSON. */
  public serialize(scenario: ScenarioDefinition): string {
    return JSON.stringify(scenario, null, 2);
  }
}

