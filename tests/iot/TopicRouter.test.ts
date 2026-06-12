import { describe, expect, it } from 'vitest';
import { TopicRouter } from '@iot/TopicRouter';

describe('TopicRouter', () => {
  it('matches MQTT wildcards', () => {
    const router = new TopicRouter();

    expect(router.matches('factory/robots/+/telemetry', 'factory/robots/r1/telemetry')).toBe(true);
    expect(router.matches('factory/#', 'factory/robots/r1/battery')).toBe(true);
  });
});

