/** UI panel, chart, control, alert, and notification contracts. */

import type { AlertSeverity } from './robot.types';

export type PanelId =
  | 'telemetry'
  | 'state-machine'
  | 'sensors'
  | 'mqtt'
  | 'pid'
  | 'fleet'
  | 'inventory'
  | 'alerts'
  | 'cloud'
  | 'opcua'
  | 'edge'
  | 'maintenance'
  | 'profiler'
  | 'replay';

export interface PanelState {
  readonly id: PanelId;
  readonly title: string;
  readonly open: boolean;
  readonly priority: number;
}

export interface HUDMetric {
  readonly label: string;
  readonly value: string;
  readonly tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export interface ChartSample {
  readonly timestamp: number;
  readonly values: readonly number[];
}

export interface Notification {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly message: string;
  readonly createdAtMs: number;
}

export interface ControlCommand {
  readonly id: string;
  readonly label: string;
  readonly enabled: boolean;
}

