/**
 * DOM dashboard manager for industrial telemetry panels and controls.
 */

import type { ProfilerSnapshot } from '@core/PerformanceProfiler';
import type { EdgeSummary } from '@iot/EdgeNode';
import type { OPCUANode } from '@iot/OPCUASimulator';
import type { Alert, FleetMetrics, FleetTask, MQTTMessage, RobotDigitalTwin, ShelfEntity } from '@types';
import { ControlPanel } from './controls/ControlPanel';
import { AlertPanel } from './panels/AlertPanel';
import { CloudPanel } from './panels/CloudPanel';
import { EdgeNodePanel } from './panels/EdgeNodePanel';
import { FleetPanel } from './panels/FleetPanel';
import { InventoryPanel } from './panels/InventoryPanel';
import { MaintenancePanel } from './panels/MaintenancePanel';
import { MQTTPanel } from './panels/MQTTPanel';
import { OPCUAPanel } from './panels/OPCUAPanel';
import { PIDPanel } from './panels/PIDPanel';
import { ProfilerPanel } from './panels/ProfilerPanel';
import { ReplayPanel } from './panels/ReplayPanel';
import { SensorPanel } from './panels/SensorPanel';
import { StateMachinePanel } from './panels/StateMachinePanel';
import { TelemetryPanel } from './panels/TelemetryPanel';

export interface DashboardSnapshot {
  readonly robots: readonly RobotDigitalTwin[];
  readonly mqttMessages: readonly MQTTMessage[];
  readonly shelves: readonly ShelfEntity[];
  readonly tasks: readonly FleetTask[];
  readonly metrics: FleetMetrics | null;
  readonly profiler: ProfilerSnapshot;
  readonly alerts: readonly Alert[];
  readonly cloudCount: number;
  readonly opcNodes: readonly OPCUANode[];
  readonly edgeSummaries: readonly EdgeSummary[];
  readonly replayFrames: number;
}

export class UIManager {
  private readonly telemetry = new TelemetryPanel();
  private readonly stateMachine = new StateMachinePanel();
  private readonly sensors = new SensorPanel();
  private readonly mqtt = new MQTTPanel();
  private readonly pid = new PIDPanel();
  private readonly fleet = new FleetPanel();
  private readonly inventory = new InventoryPanel();
  private readonly alerts = new AlertPanel();
  private readonly cloud = new CloudPanel();
  private readonly opcua = new OPCUAPanel();
  private readonly edge = new EdgeNodePanel();
  private readonly maintenance = new MaintenancePanel();
  private readonly profiler = new ProfilerPanel();
  private readonly replay = new ReplayPanel();
  private readonly controls = new ControlPanel();
  private mounted = false;

  public constructor(private readonly root: HTMLElement) {
    this.installStyles();
  }

  /** Render the full dashboard snapshot. */
  public render(snapshot: DashboardSnapshot): void {
    this.ensureMounted();
    const selected = snapshot.robots[0] ?? null;
    const leftRail = this.root.querySelector<HTMLElement>('[data-region="left-rail"]');
    const rightRail = this.root.querySelector<HTMLElement>('[data-region="right-rail"]');
    if (!leftRail || !rightRail) {
      throw new Error('Dashboard rails are not mounted.');
    }

    leftRail.innerHTML = `<div class="brand"><b>SMART FACTORY</b><span>DIGITAL TWIN</span></div>
        ${this.telemetry.render(selected)}
        ${this.stateMachine.render(selected)}
        ${this.sensors.render(selected)}
        ${this.pid.render({ error: selected?.sensors.irArray.lineError ?? 0, p: 0, i: 0, d: 0, output: 0 })}
        ${this.controls.render()}`;

    rightRail.innerHTML = `${this.fleet.render(snapshot.robots, snapshot.tasks, snapshot.metrics)}
        ${this.inventory.render(snapshot.shelves)}
        ${this.alerts.render(snapshot.alerts)}
        ${this.mqtt.render(snapshot.mqttMessages)}
        <div class="mini-grid">
          ${this.cloud.render(snapshot.cloudCount)}
          ${this.edge.render(snapshot.edgeSummaries)}
          ${this.replay.render(snapshot.replayFrames)}
        </div>
        ${this.opcua.render(snapshot.opcNodes)}
        ${this.maintenance.render(selected)}
        ${this.profiler.render(snapshot.profiler)}`;
  }

  /** Return the current scene container after render. */
  public sceneRoot(): HTMLElement {
    const element = this.root.querySelector<HTMLElement>('#scene-root');
    if (!element) {
      throw new Error('Scene root is not mounted.');
    }
    return element;
  }

  private ensureMounted(): void {
    if (this.mounted) {
      return;
    }

    this.root.innerHTML = `<div class="app-shell">
      <aside class="left-rail" data-region="left-rail"></aside>
      <main class="viewport"><div id="scene-root"></div></main>
      <aside class="right-rail" data-region="right-rail"></aside>
    </div>`;
    this.mounted = true;
  }

  private installStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        color-scheme: dark;
        --bg: #0A0E1A;
        --panel: rgba(10, 14, 26, 0.85);
        --panel-2: #111827;
        --border: #1E2D40;
        --grid: #1A2035;
        --cyan: #00D4FF;
        --green: #00FF88;
        --amber: #FFB300;
        --red: #FF3B30;
        --text: #E6EDF7;
        --muted: #8B9BB4;
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--bg); color: var(--text); font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow: hidden; }
      code, strong, time { font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace; }
      .app-shell { width: 100vw; height: 100vh; display: grid; grid-template-columns: 340px minmax(0, 1fr) 390px; background: var(--bg); }
      .viewport { min-width: 0; min-height: 0; position: relative; border-inline: 1px solid var(--border); }
      #scene-root { position: absolute; inset: 0; }
      .left-rail, .right-rail { min-height: 0; overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; background: linear-gradient(180deg, #0A0E1A 0%, #0D1424 100%); }
      .brand { height: 48px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); padding: 0 12px; background: #0D1424; }
      .brand b { font-size: 13px; letter-spacing: 0; }
      .brand span { font-size: 10px; color: var(--cyan); font-family: "JetBrains Mono", monospace; }
      .panel { border: 1px solid var(--border); background: var(--panel); backdrop-filter: blur(12px); border-radius: 4px; padding: 10px; }
      .panel h2 { margin: 0 0 9px; font-size: 12px; font-weight: 650; color: var(--text); }
      .panel.tall { min-height: 220px; }
      .panel.mini { min-height: 74px; display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; align-items: end; }
      .panel.mini h2 { grid-column: 1 / -1; }
      .panel.mini strong { font-size: 21px; color: var(--cyan); }
      .panel.mini span { color: var(--muted); font-size: 11px; }
      .metric-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .metric-grid.compact { gap: 6px; }
      .metric-grid div { min-height: 48px; border: 1px solid var(--grid); padding: 7px; background: #0D1424; }
      .metric-grid span, .stock-list span, .scope span { display: block; color: var(--muted); font-size: 10px; }
      .metric-grid strong { display: block; margin-top: 4px; font-size: 14px; color: var(--text); }
      .state-list { display: flex; flex-wrap: wrap; gap: 5px; }
      .state-list span { border: 1px solid var(--grid); color: var(--muted); padding: 4px 6px; font-size: 10px; font-family: "JetBrains Mono", monospace; }
      .state-list .active { color: var(--bg); background: var(--cyan); border-color: var(--cyan); }
      .sensor-bars { height: 54px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; align-items: end; padding: 6px; border: 1px solid var(--grid); background: #0D1424; margin-bottom: 8px; }
      .sensor-bars i { display: block; background: var(--cyan); min-height: 8px; }
      .feed, .node-list, .alert-list, .stock-list { display: grid; gap: 6px; }
      .feed div, .node-list div, .stock-list div, .alert-list div { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 7px; align-items: center; min-height: 26px; border: 1px solid var(--grid); background: #0D1424; padding: 5px; font-size: 11px; }
      .feed code, .node-list code { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--cyan); }
      .feed span { color: var(--amber); font-family: "JetBrains Mono", monospace; }
      .feed time { color: var(--muted); font-size: 10px; }
      .scope { display: grid; gap: 7px; }
      .scope div { display: grid; grid-template-columns: 48px 1fr 64px; gap: 6px; align-items: center; }
      .scope b { height: 8px; min-width: 2px; display: block; background: var(--cyan); }
      .scope b.green { background: var(--green); }
      .scope b.amber { background: var(--amber); }
      .scope b.red { background: var(--red); }
      meter { width: 100%; height: 8px; }
      .alert-list .critical { color: var(--red); }
      .alert-list .warning { color: var(--amber); }
      .empty { margin: 0; color: var(--muted); font-size: 12px; }
      .controls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .controls h2 { grid-column: 1 / -1; }
      button { height: 32px; border-radius: 4px; border: 1px solid var(--border); background: #0D1424; color: var(--text); font: inherit; font-size: 12px; cursor: pointer; }
      button:hover { border-color: var(--cyan); }
      button.danger { color: var(--red); border-color: color-mix(in srgb, var(--red), var(--border)); }
      .mini-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
      @media (max-width: 1100px) {
        .app-shell { grid-template-columns: 300px minmax(0, 1fr); }
        .right-rail { display: none; }
      }
      @media (max-width: 760px) {
        .app-shell { grid-template-columns: 1fr; grid-template-rows: 48vh 52vh; }
        .left-rail { grid-row: 2; }
        .viewport { grid-row: 1; border-inline: 0; border-bottom: 1px solid var(--border); }
      }
    `;
    document.head.appendChild(style);
  }
}
