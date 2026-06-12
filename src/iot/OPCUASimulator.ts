/**
 * Simplified OPC-UA node tree for factory machine telemetry.
 */

export interface OPCUANode {
  readonly nodeId: string;
  readonly label: string;
  readonly value: string | number | boolean;
}

export class OPCUASimulator {
  private readonly nodes = new Map<string, OPCUANode>();

  public constructor() {
    this.write('ns=1;s=Factory.TotalOutput', 'Total Output', 0);
    this.write('ns=1;s=Factory.AverageCycleTime', 'Average Cycle Time', 0);
    this.write('ns=1;s=Factory.ActiveRobots', 'Active Robots', 0);
  }

  /** Write a node value. */
  public write(nodeId: string, label: string, value: string | number | boolean): void {
    this.nodes.set(nodeId, { nodeId, label, value });
  }

  /** Read a node value. */
  public read(nodeId: string): OPCUANode | null {
    return this.nodes.get(nodeId) ?? null;
  }

  /** Return all nodes. */
  public all(): readonly OPCUANode[] {
    return Array.from(this.nodes.values());
  }
}

