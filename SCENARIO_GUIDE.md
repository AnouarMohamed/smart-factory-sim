# Scenario Guide

## Small Warehouse

The default first-load scenario. It uses a 20x20 grid, two robots, three shelf rows, one conveyor, two docks, two chargers, workers, and normal plus high-priority tasks. It is designed to make the complete loop easy to inspect.

## Large Industrial Facility

A 60x60 layout with five robots and larger routes. It stresses path planning, fleet task assignment, telemetry volume, and scene scale.

## Chaos Stress Test

A 40x40 high-pressure layout with four robots, dense movement, blocked cells, and critical tasks. It is the place to extend failure injection and anomaly escalation.

## Night Shift

A low-light 40x40 layout with reduced workers and critical restocking tasks. It exercises day/night lighting and lower production density.

## Multi-Robot Swarm

A 50x50 layout with ten robots. It is intended for future route reservation, conflict visualization, and swarm-level optimization.

## Scenario Editor Model

`src/ui/ScenarioEditor.ts` validates essential constraints:

- At least one robot.
- At least one loading dock.
- At least one charging station.

Scenario JSON follows `ScenarioDefinition` from `src/types/factory.types.ts`.

