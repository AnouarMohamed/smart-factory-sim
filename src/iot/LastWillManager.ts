/**
 * Last Will and Testament registry for simulated MQTT client disconnects.
 */

import type { LastWill } from '@types';

export class LastWillManager {
  private readonly wills = new Map<string, LastWill>();

  /** Register a client last will. */
  public register(clientId: string, will: LastWill | null): void {
    if (!will) {
      this.wills.delete(clientId);
      return;
    }

    this.wills.set(clientId, will);
  }

  /** Consume and remove a client last will. */
  public consume(clientId: string): LastWill | null {
    const will = this.wills.get(clientId) ?? null;
    this.wills.delete(clientId);
    return will;
  }
}

