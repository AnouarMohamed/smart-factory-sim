/**
 * DOM dashboard manager for a simulation-first control surface.
 */

import type { ProfilerSnapshot } from '@core/PerformanceProfiler';
import type { EdgeSummary } from '@iot/EdgeNode';
import type { OPCUANode } from '@iot/OPCUASimulator';
import type { Alert, FleetMetrics, FleetTask, MQTTMessage, RobotDigitalTwin, ShelfEntity } from '@types';

export type RouteKey = 'A-B' | 'A-C' | 'B-D' | 'C-D';

export type DashboardCommand =
  | { readonly type: 'select-pov'; readonly robotId: string }
  | { readonly type: 'overview' }
  | { readonly type: 'set-route'; readonly robotId: string; readonly routeKey: RouteKey }
  | { readonly type: 'set-speed'; readonly scale: number };

export interface DashboardSnapshot {
  readonly robots: readonly RobotDigitalTwin[];
  readonly selectedRobotId: string | null;
  readonly routeAssignments: Readonly<Record<string, RouteKey>>;
  readonly mqttMessages: readonly MQTTMessage[];
  readonly shelves: readonly ShelfEntity[];
  readonly tasks: readonly FleetTask[];
  readonly metrics: FleetMetrics | null;
  readonly timeScale: number;
  readonly paused: boolean;
  readonly profiler: ProfilerSnapshot;
  readonly alerts: readonly Alert[];
  readonly cloudCount: number;
  readonly opcNodes: readonly OPCUANode[];
  readonly edgeSummaries: readonly EdgeSummary[];
  readonly replayFrames: number;
}

export class UIManager {
  private mounted = false;

  public constructor(
    private readonly root: HTMLElement,
    private readonly onCommand: (command: DashboardCommand) => void
  ) {
    this.installStyles();
    this.root.addEventListener('click', (event): void => this.handleClick(event));
  }

  /** Render the simulation HUD without replacing the Three.js canvas. */
  public render(snapshot: DashboardSnapshot): void {
    this.ensureMounted();
    const selected =
      snapshot.robots.find((robot) => robot.id === snapshot.selectedRobotId) ?? snapshot.robots[0] ?? null;
    const topBar = this.region('top-bar');
    const telemetryStrip = this.region('telemetry-strip');
    const inspector = this.region('inspector');
    const feed = this.region('feed');

    topBar.innerHTML = this.renderTopBar(snapshot, selected);
    telemetryStrip.innerHTML = this.renderTelemetryStrip(snapshot, selected);
    inspector.innerHTML = this.renderInspector(snapshot, selected);
    feed.innerHTML = this.renderFeed(snapshot.mqttMessages);
  }

  /** Return the stable scene container. */
  public sceneRoot(): HTMLElement {
    const element = this.root.querySelector<HTMLElement>('#scene-root');
    if (!element) {
      throw new Error('Scene root is not mounted.');
    }
    return element;
  }

  private renderTopBar(snapshot: DashboardSnapshot, selected: RobotDigitalTwin | null): string {
    const state = selected?.state.kind ?? 'OFFLINE';
    const active = snapshot.metrics?.activeRobots ?? snapshot.robots.length;
    return `<div class="system-title">
        <strong>Smart Factory Sim</strong>
        <span>Factory floor, stations A B C D</span>
      </div>
      <div class="top-metrics">
        ${this.metric('Robot', selected?.id ?? 'none')}
        ${this.metric('State', state)}
        ${this.metric('Active', `${active}/${snapshot.robots.length}`)}
        ${this.metric('FPS', snapshot.profiler.fps.toFixed(0))}
      </div>
      <div class="command-bar">
        <button data-command="overview" class="${snapshot.selectedRobotId === null ? 'active' : ''}">Factory</button>
        ${snapshot.robots
          .map(
            (robot) =>
              `<button data-command="select-pov" data-robot-id="${robot.id}" class="${robot.id === snapshot.selectedRobotId ? 'active' : ''}">${robot.id}</button>`
          )
          .join('')}
      </div>`;
  }

  private renderTelemetryStrip(snapshot: DashboardSnapshot, selected: RobotDigitalTwin | null): string {
    const speed = selected ? `${selected.velocity.linear.toFixed(2)} m/s` : '0.00 m/s';
    const battery = selected ? `${selected.battery.soc.toFixed(1)}%` : '0.0%';
    const ultrasonic = selected ? `${selected.sensors.ultrasonic.distanceM.toFixed(2)} m` : '0.00 m';
    const lineError = selected ? selected.sensors.irArray.lineError.toFixed(2) : '0.00';
    const queued = snapshot.metrics?.queuedTasks ?? snapshot.tasks.filter((task) => task.status === 'QUEUED').length;
    const mqttRate = `${snapshot.profiler.mqttMessagesPerSecond.toFixed(1)}/s`;

    return `${this.metric('Speed', speed)}
      ${this.metric('Battery', battery)}
      ${this.metric('Ultrasonic', ultrasonic)}
      ${this.metric('Line error', lineError)}
      ${this.metric('Queued', String(queued))}
      ${this.metric('MQTT', mqttRate)}`;
  }

  private renderInspector(snapshot: DashboardSnapshot, selected: RobotDigitalTwin | null): string {
    const alerts = selected?.alerts.slice(-3) ?? [];
    const currentTask = selected?.currentTask;
    const stockAverage =
      snapshot.shelves.length === 0
        ? 0
        : snapshot.shelves.reduce((sum, shelf) => sum + shelf.stockLevel / shelf.capacity, 0) /
          snapshot.shelves.length;

    const routeKey = selected ? snapshot.routeAssignments[selected.id] : null;

    return `<section class="hud-panel">
      <header><span>Mission</span><strong>${selected?.state.kind ?? 'offline'}</strong></header>
      <div class="rows">
        ${this.row('Route', routeKey ?? 'unassigned')}
        ${this.row('Pickup', currentTask ? `${currentTask.pickup.x}, ${currentTask.pickup.y}` : 'station pending')}
        ${this.row('Dropoff', currentTask ? `${currentTask.dropoff.x}, ${currentTask.dropoff.y}` : 'station pending')}
        ${this.row('Path', `${selected?.path.length ?? 0} cells`)}
        ${this.row('Inventory', `${(stockAverage * 100).toFixed(0)}% avg`)}
        ${this.row('Cloud', `${snapshot.cloudCount} msgs`)}
        ${this.row('Replay', `${snapshot.replayFrames} frames`)}
      </div>
    </section>
    <section class="hud-panel">
      <header><span>Factory Controls</span><strong>${snapshot.paused ? 'paused' : `${snapshot.timeScale.toFixed(1)}x`}</strong></header>
      <div class="control-row">
        <span>Clock</span>
        ${this.speedButton('Pause', 0, snapshot)}
        ${this.speedButton('0.5x', 0.5, snapshot)}
        ${this.speedButton('1x', 1, snapshot)}
        ${this.speedButton('2x', 2, snapshot)}
      </div>
    </section>
    <section class="hud-panel">
      <header><span>Car Routes</span><strong>A B C D</strong></header>
      <div class="route-controls">
        ${snapshot.robots
          .map(
            (robot) => `<div>
              <span>${robot.id}</span>
              ${(['A-B', 'A-C', 'B-D', 'C-D'] as const)
                .map(
                  (route) =>
                    `<button data-command="set-route" data-robot-id="${robot.id}" data-route-key="${route}" class="${snapshot.routeAssignments[robot.id] === route ? 'active' : ''}">${route}</button>`
                )
                .join('')}
            </div>`
          )
          .join('')}
      </div>
    </section>
    <section class="hud-panel">
      <header><span>Incidents</span><strong>${alerts.length}</strong></header>
      <div class="incident-list">
        ${
          alerts.length === 0
            ? '<p>Nominal operation</p>'
            : alerts.map((alert) => `<p class="${alert.severity.toLowerCase()}">${alert.message}</p>`).join('')
        }
      </div>
    </section>`;
  }

  private renderFeed(messages: readonly MQTTMessage[]): string {
    return messages
      .slice(-5)
      .reverse()
      .map((message) => `<span>${message.qos}</span><code>${message.topic}</code>`)
      .join('');
  }

  private metric(label: string, value: string): string {
    return `<div class="hud-metric"><span>${label}</span><strong>${value}</strong></div>`;
  }

  private row(label: string, value: string): string {
    return `<div><span>${label}</span><strong>${value}</strong></div>`;
  }

  private region(name: string): HTMLElement {
    const element = this.root.querySelector<HTMLElement>(`[data-region="${name}"]`);
    if (!element) {
      throw new Error(`Dashboard region is not mounted: ${name}`);
    }
    return element;
  }

  private ensureMounted(): void {
    if (this.mounted) {
      return;
    }

    this.root.innerHTML = `<div class="app-shell">
      <main class="viewport">
        <div id="scene-root"></div>
        <div class="top-bar" data-region="top-bar"></div>
        <div class="inspector" data-region="inspector"></div>
        <div class="telemetry-strip" data-region="telemetry-strip"></div>
        <div class="mqtt-strip" data-region="feed"></div>
      </main>
    </div>`;
    this.mounted = true;
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest<HTMLButtonElement>('button[data-command]');
    if (!button) {
      return;
    }

    const command = button.dataset.command;
    if (command === 'overview') {
      this.onCommand({ type: 'overview' });
      return;
    }

    if (command === 'select-pov' && button.dataset.robotId) {
      this.onCommand({ type: 'select-pov', robotId: button.dataset.robotId });
      return;
    }

    if (
      command === 'set-route' &&
      button.dataset.robotId &&
      this.isRouteKey(button.dataset.routeKey)
    ) {
      this.onCommand({
        type: 'set-route',
        robotId: button.dataset.robotId,
        routeKey: button.dataset.routeKey
      });
      return;
    }

    if (command === 'set-speed') {
      const scale = Number(button.dataset.scale);
      if (Number.isFinite(scale)) {
        this.onCommand({ type: 'set-speed', scale });
      }
    }
  }

  private isRouteKey(value: string | undefined): value is RouteKey {
    return value === 'A-B' || value === 'A-C' || value === 'B-D' || value === 'C-D';
  }

  private speedButton(label: string, scale: number, snapshot: DashboardSnapshot): string {
    const active = scale === 0 ? snapshot.paused : !snapshot.paused && snapshot.timeScale === scale;
    return `<button data-command="set-speed" data-scale="${scale}" class="${active ? 'active' : ''}">${label}</button>`;
  }

  private installStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        color-scheme: dark;
        --bg: oklch(16% 0.018 245);
        --surface: oklch(20% 0.02 245 / 0.94);
        --surface-2: oklch(24% 0.018 245 / 0.94);
        --border: oklch(38% 0.035 245);
        --text: oklch(93% 0.012 245);
        --muted: oklch(70% 0.03 245);
        --cyan: oklch(78% 0.16 220);
        --green: oklch(82% 0.2 155);
        --amber: oklch(82% 0.16 80);
        --red: oklch(66% 0.22 30);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        overflow: hidden;
        background: var(--bg);
        color: var(--text);
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      code, strong { font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace; }
      .app-shell, .viewport, #scene-root { width: 100vw; height: 100vh; }
      .viewport { position: relative; min-width: 0; min-height: 0; }
      #scene-root { position: absolute; inset: 0; }
      .top-bar, .telemetry-strip, .inspector, .mqtt-strip {
        position: absolute;
        z-index: 2;
        border: 1px solid var(--border);
        background: var(--surface);
        box-shadow: 0 18px 50px oklch(7% 0.02 245 / 0.35);
      }
      .top-bar {
        left: 16px;
        right: 16px;
        top: 14px;
        min-height: 56px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 10px 12px;
        border-radius: 4px;
      }
      .system-title { display: grid; gap: 2px; min-width: 190px; }
      .system-title strong { font-size: 15px; letter-spacing: 0; }
      .system-title span { color: var(--muted); font-size: 12px; }
      .top-metrics, .telemetry-strip {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(116px, 1fr);
        gap: 1px;
      }
      .command-bar {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .hud-metric {
        min-width: 0;
        min-height: 42px;
        padding: 7px 10px;
        background: var(--surface-2);
      }
      .hud-metric span, .rows span, .hud-panel header span {
        display: block;
        color: var(--muted);
        font-size: 10px;
        line-height: 1.2;
      }
      .hud-metric strong {
        display: block;
        margin-top: 4px;
        color: var(--text);
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .telemetry-strip {
        left: 16px;
        right: 332px;
        bottom: 16px;
        border-radius: 4px;
        overflow: hidden;
      }
      .inspector {
        right: 16px;
        bottom: 16px;
        width: 300px;
        display: grid;
        gap: 10px;
        border: 0;
        background: transparent;
        box-shadow: none;
      }
      .hud-panel {
        border: 1px solid var(--border);
        border-radius: 4px;
        background: var(--surface);
        padding: 10px;
      }
      .hud-panel header {
        display: flex;
        align-items: end;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .hud-panel header strong { color: var(--cyan); font-size: 13px; }
      .rows { display: grid; gap: 6px; }
      .rows div {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 6px 0;
        border-top: 1px solid oklch(35% 0.025 245 / 0.55);
      }
      .rows strong { font-size: 12px; color: var(--text); }
      .route-controls { display: grid; gap: 8px; }
      .route-controls div { display: grid; grid-template-columns: 58px repeat(4, 1fr); gap: 6px; align-items: center; }
      .route-controls span, .control-row span { color: var(--muted); font-size: 11px; }
      .control-row { display: grid; grid-template-columns: 58px repeat(4, 1fr); gap: 6px; align-items: center; }
      button {
        height: 30px;
        border: 1px solid var(--border);
        border-radius: 4px;
        background: var(--surface-2);
        color: var(--text);
        font: 12px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        cursor: pointer;
      }
      button:hover, button.active {
        border-color: var(--cyan);
        color: var(--cyan);
      }
      .incident-list { display: grid; gap: 6px; }
      .incident-list p {
        margin: 0;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.35;
      }
      .incident-list .warning { color: var(--amber); }
      .incident-list .critical { color: var(--red); }
      .mqtt-strip {
        left: 16px;
        bottom: 92px;
        max-width: min(720px, calc(100vw - 360px));
        min-height: 32px;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 4px 8px;
        align-items: center;
        padding: 8px 10px;
        border-radius: 4px;
      }
      .mqtt-strip span {
        color: var(--amber);
        font: 11px "JetBrains Mono", monospace;
      }
      .mqtt-strip code {
        color: var(--cyan);
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      @media (max-width: 880px) {
        .top-bar {
          left: 10px;
          right: 10px;
          top: 10px;
          display: grid;
        }
        .command-bar { justify-content: start; }
        .top-metrics {
          grid-auto-flow: initial;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .telemetry-strip {
          left: 10px;
          right: 10px;
          bottom: 10px;
          grid-auto-flow: initial;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .inspector, .mqtt-strip { display: none; }
      }
    `;
    document.head.appendChild(style);
  }
}
