/**
 * OPC-UA node tree panel renderer.
 */

import type { OPCUANode } from '@iot/OPCUASimulator';

export class OPCUAPanel {
  /** Render OPC-UA nodes. */
  public render(nodes: readonly OPCUANode[]): string {
    return `<section class="panel">
      <h2>OPC-UA</h2>
      <div class="node-list">
        ${nodes.map((node) => `<div><code>${node.nodeId}</code><strong>${String(node.value)}</strong></div>`).join('')}
      </div>
    </section>`;
  }
}

