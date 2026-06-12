/** Typed simulation timing, physics, UI, and performance constants. */

export interface SimulationConfig {
  readonly physicsHz: number;
  readonly logicHz: number;
  readonly renderHz: number;
  readonly maxPhysicsCatchupSteps: number;
  readonly gravityMps2: number;
  readonly defaultTimeScale: number;
  readonly profilerWindowMs: number;
}

export const SIMULATION_CONFIG: SimulationConfig = {
  physicsHz: 100,
  logicHz: 20,
  renderHz: 60,
  maxPhysicsCatchupSteps: 5,
  gravityMps2: 9.80665,
  defaultTimeScale: 1,
  profilerWindowMs: 5000
} as const;

