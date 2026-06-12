import { describe, expect, it } from 'vitest';
import { CollisionDetector } from '@physics/CollisionDetector';

describe('CollisionDetector', () => {
  it('detects circle overlap', () => {
    const detector = new CollisionDetector();

    expect(
      detector.intersectsCircle(
        { center: { x: 0, y: 0 }, radius: 1 },
        { center: { x: 1.5, y: 0 }, radius: 1 }
      )
    ).toBe(true);
  });
});

