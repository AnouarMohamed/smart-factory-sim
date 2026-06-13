# Documentation Index

This directory collects reviewer-facing documentation for the Smart Factory Sim. Use it with the root README when reviewing feature, Docker, and CI changes.

## Start Here

| Document | Purpose |
|---|---|
| [Project README](../README.md) | Product summary, demo media, quick start, controls, and repository map. |
| [Architecture](../ARCHITECTURE.md) | Core data flow, module ownership, and simulation boundaries. |
| [Architecture Deep Dive](ARCHITECTURE_DEEP_DIVE.md) | Runtime composition, tick channels, mission flow, camera ownership, and hot reload safety. |
| [Operations Runbook](OPERATIONS_RUNBOOK.md) | Local startup, demo checklist, control expectations, and release readiness. |
| [Troubleshooting](TROUBLESHOOTING.md) | Common local, Docker, and CI failures with first-response checks. |
| [Team Workflow](TEAM_WORKFLOW.md) | Branch naming, stacked PRs, merge order, and review expectations. |
| [Docker](DOCKER.md) | Production image, Compose workflow, runtime layout, and validation commands. |
| [CI Pipeline](CI_PIPELINE.md) | GitHub Actions workflows, local parity commands, and the 10-PR merge stack. |
| [Plan](../PLAN.md) | Original project plan and implementation scope. |
| [Development Log](../DEVLOG.md) | Architecture decisions, trade-offs, and dated build notes. |
| [Changelog](../CHANGELOG.md) | Release-facing summary of notable changes. |

## Domain References

| Document | Purpose |
|---|---|
| [Digital Twin](../DIGITAL_TWIN.md) | Robot twin state contract and synchronization model. |
| [MQTT Spec](../MQTT_SPEC.md) | Broker topics, retained messages, QoS behavior, and telemetry format. |
| [Physics](../PHYSICS.md) | Differential drive, collision, path following, and payload notes. |
| [Scenario Guide](../SCENARIO_GUIDE.md) | Scenario JSON structure and factory entity definitions. |
| [Firmware](../FIRMWARE.md) | Virtual Arduino firmware mirror and hardware abstractions. |
| [Contributing](../CONTRIBUTING.md) | Local commands, architecture rules, and PR expectations. |

## Demo Assets

| Asset | Purpose |
|---|---|
| [Factory overview](media/factory-overview.png) | Full factory view with stations, routes, cars, and controls. |
| [Robot 1 POV](media/robot-1-pov.png) | Follow camera for the first logistics car. |
| [Robot 2 POV](media/robot-2-pov.png) | Follow camera for the second logistics car. |
| [Route controls](media/route-controls.png) | Route reassignment state for car paths. |
| [Paused controls](media/paused-controls.png) | Clock pause state and active route controls. |
| [Mobile overview](media/mobile-overview.png) | Compact mobile HUD layout. |
| [Animated walkthrough preview](media/smart-factory-demo.gif) | Inline README preview with moving cars, POV switching, and route controls. |
| [Video walkthrough](media/smart-factory-demo.webm) | Short recorded operator workflow demo. |
