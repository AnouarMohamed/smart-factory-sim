/**
 * Immutable vector primitives used across physics, pathfinding, and rendering adapters.
 */

import type { Vector2 as Vector2Like, Vector3 as Vector3Like } from '@types';

export class Vector2 implements Vector2Like {
  public constructor(
    public readonly x: number,
    public readonly y: number
  ) {}

  /** Add another vector. */
  public add(other: Vector2Like): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  /** Subtract another vector. */
  public subtract(other: Vector2Like): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  /** Multiply both components by a scalar. */
  public scale(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  /** Return Euclidean length. */
  public length(): number {
    return Math.hypot(this.x, this.y);
  }

  /** Return normalized vector, or zero when length is zero. */
  public normalize(): Vector2 {
    const length = this.length();
    return length === 0 ? Vector2.zero() : this.scale(1 / length);
  }

  /** Return distance to another vector. */
  public distanceTo(other: Vector2Like): number {
    return this.subtract(other).length();
  }

  /** Return dot product with another vector. */
  public dot(other: Vector2Like): number {
    return this.x * other.x + this.y * other.y;
  }

  /** Convert to a serializable plain vector. */
  public toJSON(): Vector2Like {
    return { x: this.x, y: this.y };
  }

  /** Create a vector from a plain object. */
  public static from(value: Vector2Like): Vector2 {
    return new Vector2(value.x, value.y);
  }

  /** Create the zero vector. */
  public static zero(): Vector2 {
    return new Vector2(0, 0);
  }
}

export class Vector3 implements Vector3Like {
  public constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number
  ) {}

  /** Add another vector. */
  public add(other: Vector3Like): Vector3 {
    return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  /** Multiply all components by a scalar. */
  public scale(scalar: number): Vector3 {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /** Convert to a serializable plain vector. */
  public toJSON(): Vector3Like {
    return { x: this.x, y: this.y, z: this.z };
  }
}

