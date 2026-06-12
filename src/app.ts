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
  ScenarioDefinition,
  ScenarioTaskDefinition,
  Task
} from '@types';
import { UIManager } from '@ui/UIManager';
import type { DashboardSnapshot } from '@ui/UIManager';

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

  public constructor(root: HTMLElement) {
    this.ui = new UIManager(root);
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

    for (const taskDefinition of scenario.tasks) {
      this.fleet.enqueue(this.toTask(taskDefinition));
    }

    this.assignInitialRoutes(scenario);
    this.ui.render(this.snapshot());
  }

  private assignInitialRoutes(scenario: ScenarioDefinition): void {
    if (!this.factory) {
      return;
    }

    const planner = new AStarPlanner(this.factory.grid.navigation());
    const tasks = this.fleet.tasks();
    this.robots.forEach((robot, index) => {
      const task = tasks[index % Math.max(1, tasks.length)];
      if (!task) {
        return;
      }

      const start = scenario.robots.find((candidate) => candidate.id === robot.id)?.start ?? { x: 1, y: 1 };
      const pickupPlan = planner.plan(start, task.pickup);
      const dropoffPlan = planner.plan(task.pickup, task.dropoff);
      const path = this.smoother.smooth([...pickupPlan.path, ...dropoffPlan.path.slice(1)]);
      robot.assignTask(task, path, this.clock.now());
    });
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
    this.scene.render(twins[0] ?? null);
    this.profiler.recordFrame();

    if (simTimeMs - this.lastUiRenderMs > 250) {
      this.ui.render(this.snapshot());
      this.lastUiRenderMs = simTimeMs;
    }

    this.profiler.record('render', performance.now() - startedAt);
  }

  private snapshot(): DashboardSnapshot {
    const twins = this.digitalTwin.allRobots();
    const alerts = twins.flatMap((twin) => twin.alerts);
    return {
      robots: twins,
      mqttMessages: this.messageBus.recent(30),
      shelves: this.factory?.shelves.all() ?? [],
      tasks: this.fleet.tasks(),
      metrics: this.metrics,
      profiler: this.profiler.snapshot(),
      alerts,
      cloudCount: this.cloud.count(),
      opcNodes: this.opcua.all(),
      edgeSummaries: this.edgeSummaries,
      replayFrames: this.replay.getFrames().length
    };
  }

  private toTask(taskDefinition: ScenarioTaskDefinition): Task {
    return {
      id: taskDefinition.id,
      priority: taskDefinition.priority,
      pickup: taskDefinition.pickup,
      dropoff: taskDefinition.dropoff,
      payload: {
        id: `${taskDefinition.id}-payload`,
        itemId: taskDefinition.itemId,
        weightKg: taskDefinition.weightKg,
        dimensionsM: { width: 0.28, depth: 0.22, height: 0.18 }
      },
      createdAtMs: this.clock.now()
    };
  }
}
