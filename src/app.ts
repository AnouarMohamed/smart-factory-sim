/**
 * Root application class that composes simulation, digital twin, MQTT, rendering, and UI.
 */

import smallWarehouseData from '../config/scenarios/small-warehouse.json';
import { MQTT_CONFIG, MQTT_TOPICS } from '@config/mqtt.config';
import { SIMULATION_CONFIG } from '@config/simulation.config';
import { EventBus } from '@core/EventBus';
import { Logger } from '@core/Logger';
import { PerformanceProfiler } from '@core/PerformanceProfiler';
import { ReplayRecorder } from '@core/ReplayRecorder';
import { SimulationClock } from '@core/SimulationClock';
import { TickScheduler } from '@core/TickScheduler';
import { FactoryWorld } from '@factory/FactoryWorld';
import { FleetManager } from '@fleet/FleetManager';
import { CloudConnector } from '@iot/CloudConnector';
import { DigitalTwin } from '@iot/DigitalTwin';
import { EdgeNode, type EdgeSummary } from '@iot/EdgeNode';
import { MessageBus } from '@iot/MessageBus';
import { MQTTBroker } from '@iot/MQTTBroker';
import { MQTTClient } from '@iot/MQTTClient';
import { OPCUASimulator } from '@iot/OPCUASimulator';
import { TelemetryStore } from '@iot/TelemetryStore';
import { TwinSynchronizer } from '@iot/TwinSynchronizer';
import { AStarPlanner } from '@pathfinding/AStarPlanner';
import { PathSmoother } from '@pathfinding/PathSmoother';
import { SceneManager } from '@rendering/SceneManager';
import { RobotController } from '@robot/RobotController';
import { TelemetryEmitter } from '@robot/TelemetryEmitter';
import type {
  FleetMetrics,
  RobotDigitalTwin,
  ScenarioDefinition,
  Task
} from '@types';
import { UIManager } from '@ui/UIManager';
import type { DashboardCommand, DashboardSnapshot, RouteKey } from '@ui/UIManager';

type StationId = 'A' | 'B' | 'C' | 'D';

const FACTORY_STATIONS: Readonly<Record<StationId, { readonly x: number; readonly y: number }>> = {
  A: { x: 4, y: 6 },
  B: { x: 9, y: 6 },
  C: { x: 13, y: 6 },
  D: { x: 18, y: 8 }
};

const ROUTE_MAP: Readonly<Record<RouteKey, { readonly pickup: StationId; readonly dropoff: StationId }>> = {
  'A-B': { pickup: 'A', dropoff: 'B' },
  'A-C': { pickup: 'A', dropoff: 'C' },
  'B-D': { pickup: 'B', dropoff: 'D' },
  'C-D': { pickup: 'C', dropoff: 'D' }
};

export class SmartFactoryApp {
  private readonly eventBus = new EventBus();
  private readonly logger = new Logger();
  private readonly clock = new SimulationClock(SIMULATION_CONFIG.defaultTimeScale);
  private readonly profiler = new PerformanceProfiler(SIMULATION_CONFIG.profilerWindowMs);
  private readonly replay = new ReplayRecorder();
  private readonly broker = new MQTTBroker(this.eventBus);
  private readonly mqttClient = new MQTTClient('edge-sim', this.broker);
  private readonly messageBus = new MessageBus();
  private readonly digitalTwin = new DigitalTwin(this.eventBus);
  private readonly synchronizer = new TwinSynchronizer(this.digitalTwin);
  private readonly telemetryEmitter = new TelemetryEmitter();
  private readonly telemetryStore = new TelemetryStore();
  private readonly cloud = new CloudConnector();
  private readonly edge = new EdgeNode();
  private readonly opcua = new OPCUASimulator();
  private readonly fleet = new FleetManager(this.eventBus);
  private readonly smoother = new PathSmoother();
  private readonly ui: UIManager;
  private readonly scene: SceneManager;
  private readonly robots: RobotController[] = [];
  private readonly edgeSummaries: EdgeSummary[] = [];
  private factory: FactoryWorld | null = null;
  private metrics: FleetMetrics | null = null;
  private scheduler: TickScheduler | null = null;
  private lastUiRenderMs = 0;
  private selectedRobotId: string | null = null;
  private readonly routeAssignments: Record<string, RouteKey> = {
    'robot-1': 'A-B',
    'robot-2': 'C-D'
  };

  public constructor(root: HTMLElement) {
    this.ui = new UIManager(root, (command): void => this.handleDashboardCommand(command));
    this.ui.render(this.snapshot());
    this.scene = new SceneManager(this.ui.sceneRoot());
    this.bindEvents();
  }

  /** Boot the default scenario and start all simulation loops. */
  public start(): void {
    const scenario = smallWarehouseData as unknown as ScenarioDefinition;
    this.loadScenario(scenario);

    this.scheduler = new TickScheduler(this.eventBus, this.clock, SIMULATION_CONFIG, {
      physics: (event): void => this.onPhysicsTick(event.deltaMs),
      logic: (event): void => this.onLogicTick(event.simTimeMs),
      render: (event): void => this.onRenderTick(event.deltaMs, event.simTimeMs)
    });
    this.scheduler.start();
    this.logger.info('app', 'Smart Factory Sim started', { scenario: scenario.id });
  }

  /** Stop all simulation loops. */
  public stop(): void {
    this.scheduler?.stop();
  }

  private bindEvents(): void {
    this.eventBus.on('mqtt:message-published', (message): void => {
      this.messageBus.push(message);
      this.telemetryStore.appendMessage(message);
      this.cloud.ingest(message);
      this.profiler.recordMqttMessage();
      this.replay.recordMessage(message);
    });
  }

  private loadScenario(scenario: ScenarioDefinition): void {
    this.factory = new FactoryWorld(scenario, this.eventBus);
    this.scene.loadScenario(scenario);
    this.eventBus.emit('simulation:scenario-loaded', { scenarioId: scenario.id, scenario });

    for (const robotDefinition of scenario.robots) {
      const robot = new RobotController(
        robotDefinition.id,
        {
          x: robotDefinition.start.x,
          y: robotDefinition.start.y,
          theta: robotDefinition.headingRad
        },
        this.eventBus
      );
      this.robots.push(robot);
      this.synchronizer.sync(robot.twin());
    }

    this.assignInitialRoutes();
    this.ui.render(this.snapshot());
  }

  private assignInitialRoutes(): void {
    if (!this.factory) {
      return;
    }

    this.robots.forEach((robot, index) => {
      const fallbackRoute: RouteKey = index === 0 ? 'A-B' : 'C-D';
      const routeKey = this.routeAssignments[robot.id] ?? fallbackRoute;
      this.routeAssignments[robot.id] = routeKey;
      this.assignConfiguredRoute(robot.id, routeKey);
    });
  }

  private handleDashboardCommand(command: DashboardCommand): void {
    if (command.type === 'overview') {
      this.selectedRobotId = null;
      this.scene.setCameraMode('top-down');
      this.renderImmediate();
      return;
    }

    if (command.type === 'select-pov') {
      this.selectedRobotId = command.robotId;
      this.scene.setCameraMode('follow');
      this.renderImmediate();
      return;
    }

    if (command.type === 'set-route') {
      this.routeAssignments[command.robotId] = command.routeKey;
      this.assignConfiguredRoute(command.robotId, command.routeKey);
      this.renderImmediate();
      return;
    }

    if (command.type === 'set-speed') {
      this.clock.setTimeScale(command.scale);
      this.renderImmediate();
    }
  }

  private assignConfiguredRoute(robotId: string, routeKey: RouteKey): void {
    if (!this.factory) {
      return;
    }

    const robot = this.robots.find((candidate) => candidate.id === robotId);
    if (!robot) {
      return;
    }

    const route = ROUTE_MAP[routeKey];
    const pickup = FACTORY_STATIONS[route.pickup];
    const dropoff = FACTORY_STATIONS[route.dropoff];
    const charger = robotId.endsWith('2') ? { x: 3, y: 18 } : { x: 1, y: 18 };
    const planner = new AStarPlanner(this.factory.grid.navigation());
    const start = robot.currentPose();
    const pickupPath = this.planPath(planner, start, pickup);
    const dropoffPath = this.planPath(planner, pickup, dropoff);
    const chargerPath = this.planPath(planner, dropoff, charger);
    const task = this.toConfiguredTask(robotId, routeKey, pickup, dropoff);

    robot.assignMission(task, pickupPath, dropoffPath, chargerPath, this.clock.now());
    this.synchronizer.sync(robot.twin());
  }

  private planPath(
    planner: AStarPlanner,
    start: { readonly x: number; readonly y: number },
    goal: { readonly x: number; readonly y: number }
  ): readonly { readonly x: number; readonly y: number }[] {
    const plan = planner.plan(start, goal);
    const path = plan.found && plan.path.length > 0 ? plan.path : [start, goal];
    return this.smoother.smooth(path);
  }

  private onPhysicsTick(deltaMs: number): void {
    const startedAt = performance.now();
    const timestamp = this.clock.now();
    this.factory?.step(deltaMs / 1000);

    for (const robot of this.robots) {
      const twin = robot.step(deltaMs, timestamp);
      this.synchronizer.sync(twin);
    }

    this.profiler.record('physics', performance.now() - startedAt);
  }

  private onLogicTick(simTimeMs: number): void {
    const startedAt = performance.now();
    const twins = this.digitalTwin.allRobots();
    this.metrics = this.fleet.step(twins, simTimeMs);

    for (const twin of twins) {
      const telemetry = this.telemetryEmitter.toTelemetry(twin);
      this.telemetryStore.appendTelemetry(telemetry);
      this.edgeSummaries.push(this.edge.preprocess(telemetry));
      if (this.edgeSummaries.length > 30) {
        this.edgeSummaries.shift();
      }
      this.mqttClient.publish(
        MQTT_TOPICS.robotTelemetry(twin.id),
        telemetry,
        MQTT_CONFIG.policies.telemetry.qos,
        MQTT_CONFIG.policies.telemetry.retained
      );
      this.mqttClient.publish(
        MQTT_TOPICS.robotBattery(twin.id),
        { robotId: twin.id, ...twin.battery },
        MQTT_CONFIG.policies.battery.qos,
        MQTT_CONFIG.policies.battery.retained
      );
      this.opcua.write(`ns=1;s=Robot.${twin.id}.MotorHours`, `${twin.id} Motor Hours`, twin.maintenance.motorHours);
    }

    if (this.metrics) {
      this.mqttClient.publish(
        MQTT_TOPICS.fleetMetrics(),
        {
          activeRobots: this.metrics.activeRobots,
          queuedTasks: this.metrics.queuedTasks,
          completedTasks: this.metrics.completedTasks,
          averageCycleTimeSeconds: 0
        },
        MQTT_CONFIG.policies.fleetMetrics.qos,
        MQTT_CONFIG.policies.fleetMetrics.retained
      );
      this.opcua.write('ns=1;s=Factory.ActiveRobots', 'Active Robots', this.metrics.activeRobots);
    }

    this.replay.captureFrame(simTimeMs, twins);
    this.profiler.record('logic', performance.now() - startedAt);
  }

  private onRenderTick(deltaMs: number, simTimeMs: number): void {
    const startedAt = performance.now();
    const deltaSeconds = deltaMs / 1000;
    const twins = this.digitalTwin.allRobots();

    for (const twin of twins) {
      this.scene.updateRobot(twin, deltaSeconds);
    }

    this.scene.updateWorkers(this.factory?.workerSnapshots() ?? []);
    this.scene.render(this.followedTwin(twins));
    this.profiler.recordFrame();

    if (simTimeMs - this.lastUiRenderMs > 250) {
      this.ui.render(this.snapshot());
      this.lastUiRenderMs = simTimeMs;
    }

    this.profiler.record('render', performance.now() - startedAt);
  }

  private renderImmediate(): void {
    const twins = this.digitalTwin.allRobots();
    for (const twin of twins) {
      this.scene.updateRobot(twin, 0);
    }
    this.scene.updateWorkers(this.factory?.workerSnapshots() ?? []);
    this.scene.render(this.followedTwin(twins));
    this.ui.render(this.snapshot());
    this.lastUiRenderMs = this.clock.now();
  }

  private followedTwin(twins: readonly RobotDigitalTwin[]): RobotDigitalTwin | null {
    if (!this.selectedRobotId) {
      return null;
    }

    return twins.find((twin) => twin.id === this.selectedRobotId) ?? null;
  }

  private snapshot(): DashboardSnapshot {
    const twins = this.digitalTwin.allRobots();
    const alerts = twins.flatMap((twin) => twin.alerts);
    return {
      robots: twins,
      selectedRobotId: this.selectedRobotId,
      routeAssignments: this.routeAssignments,
      mqttMessages: this.messageBus.recent(30),
      shelves: this.factory?.shelves.all() ?? [],
      tasks: this.fleet.tasks(),
      metrics: this.metrics,
      timeScale: this.clock.getTimeScale(),
      paused: this.clock.isPaused(),
      profiler: this.profiler.snapshot(),
      alerts,
      cloudCount: this.cloud.count(),
      opcNodes: this.opcua.all(),
      edgeSummaries: this.edgeSummaries,
      replayFrames: this.replay.getFrames().length
    };
  }

  private toConfiguredTask(
    robotId: string,
    routeKey: RouteKey,
    pickup: { readonly x: number; readonly y: number },
    dropoff: { readonly x: number; readonly y: number }
  ): Task {
    return {
      id: `${robotId}-${routeKey}-${Math.round(this.clock.now())}`,
      priority: routeKey.endsWith('D') ? 'HIGH' : 'NORMAL',
      pickup,
      dropoff,
      payload: {
        id: `${robotId}-${routeKey}-crate`,
        itemId: `merchandise-${routeKey}`,
        weightKg: 1.2,
        dimensionsM: { width: 0.34, depth: 0.3, height: 0.24 }
      },
      createdAtMs: this.clock.now()
    };
  }
}
