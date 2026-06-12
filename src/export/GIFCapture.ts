/**
 * Animated GIF capture placeholder for rendered factory view.
 */

export class GIFCapture {
  private capturing = false;

  /** Start capture state. */
  public start(): void {
    this.capturing = true;
  }

  /** Stop capture state and return a placeholder blob. */
  public stop(): Blob {
    this.capturing = false;
    return new Blob(['GIF capture is reserved for browser encoder integration.'], {
      type: 'text/plain'
    });
  }

  /** Return true when capture is active. */
  public isCapturing(): boolean {
    return this.capturing;
  }
}

