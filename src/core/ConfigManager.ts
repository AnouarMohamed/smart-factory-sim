/**
 * Runtime registry for typed configuration objects.
 */

export class ConfigManager<TConfig extends Record<string, unknown>> {
  private readonly registry = new Map<keyof TConfig, TConfig[keyof TConfig]>();

  /** Register or replace a config section. */
  public set<K extends keyof TConfig>(key: K, value: TConfig[K]): void {
    this.registry.set(key, value);
  }

  /** Read a config section, throwing when the section is missing. */
  public get<K extends keyof TConfig>(key: K): TConfig[K] {
    const value = this.registry.get(key);
    if (value === undefined) {
      throw new Error(`Missing config section: ${String(key)}`);
    }

    return value as TConfig[K];
  }

  /** Return true when a section has been registered. */
  public has<K extends keyof TConfig>(key: K): boolean {
    return this.registry.has(key);
  }
}

