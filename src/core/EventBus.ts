/**
 * Typed publish-subscribe nervous system for simulation modules.
 */

import type { SimulationEvents } from '@types';

type EventName = keyof SimulationEvents;
type EventListener<K extends EventName> = (payload: SimulationEvents[K]) => void;
type UnknownListener = (payload: unknown) => void;

export type Unsubscribe = () => void;

export class EventBus {
  private readonly listeners = new Map<EventName, Set<UnknownListener>>();

  /** Register a listener for a typed simulation event. */
  public on<K extends EventName>(eventName: K, listener: EventListener<K>): Unsubscribe {
    const unknownListener = listener as UnknownListener;
    const listenersForEvent = this.listeners.get(eventName) ?? new Set<UnknownListener>();
    listenersForEvent.add(unknownListener);
    this.listeners.set(eventName, listenersForEvent);

    return (): void => {
      listenersForEvent.delete(unknownListener);
      if (listenersForEvent.size === 0) {
        this.listeners.delete(eventName);
      }
    };
  }

  /** Register a listener that runs once, then unsubscribes. */
  public once<K extends EventName>(eventName: K, listener: EventListener<K>): Unsubscribe {
    const unsubscribe = this.on(eventName, (payload): void => {
      unsubscribe();
      listener(payload);
    });

    return unsubscribe;
  }

  /** Emit a typed event to current subscribers. */
  public emit<K extends EventName>(eventName: K, payload: SimulationEvents[K]): void {
    const listenersForEvent = this.listeners.get(eventName);
    if (!listenersForEvent) {
      return;
    }

    for (const listener of Array.from(listenersForEvent)) {
      listener(payload);
    }
  }

  /** Return the number of listeners attached to an event. */
  public listenerCount(eventName: EventName): number {
    return this.listeners.get(eventName)?.size ?? 0;
  }

  /** Remove all listeners, or all listeners for one event. */
  public clear(eventName?: EventName): void {
    if (eventName) {
      this.listeners.delete(eventName);
      return;
    }

    this.listeners.clear();
  }
}

