import { describe, expect, it } from 'vitest';
import { ConfigManager } from '@core/ConfigManager';

interface TestConfig extends Record<string, unknown> {
  readonly robot: { readonly maxSpeed: number };
}

describe('ConfigManager', () => {
  it('stores and retrieves typed config sections', () => {
    const manager = new ConfigManager<TestConfig>();

    manager.set('robot', { maxSpeed: 1.2 });

    expect(manager.get('robot').maxSpeed).toBe(1.2);
  });
});

