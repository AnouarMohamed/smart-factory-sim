/**
 * Manual override control panel renderer.
 */

export class ControlPanel {
  /** Render primary control buttons. */
  public render(): string {
    return `<section class="panel controls">
      <h2>Controls</h2>
      <button data-command="pause">Pause</button>
      <button data-command="play">Play</button>
      <button data-command="stop" class="danger">E-Stop</button>
    </section>`;
  }
}

