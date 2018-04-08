// @flow
import invariant from 'invariant';
import Line2 from './Line2';

export type Vector2ish = Vector2 | { x: number, y: number } | [number, number];

export default class Vector2 {
  x: number;
  y: number;

  static from(vector: Vector2ish): Vector2 {
    if (vector instanceof Vector2) {
      return new Vector2(vector.x, vector.y);
    }
    if (Array.isArray(vector)) {
      invariant(typeof vector[0] === 'number', 'vector[0] must be a number');
      invariant(typeof vector[1] === 'number', 'vector[1] must be a number');
      return new Vector2(vector[0], vector[1]);
    }
    if (vector && typeof vector === 'object') {
      invariant(typeof vector.x === 'number', 'vector.x must be a number');
      invariant(typeof vector.y === 'number', 'vector.y must be a number');
      return new Vector2(vector.x, vector.y);
    }
    throw new Error('invalid type to create vector');
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  get magnitude(): number {
    return Math.sqrt(this.magnitudeSquared);
  }

  get angle(): number {
    return Math.atan2(this.y, this.x);
  }

  toString(): string {
    return `Vector2(${this.x}, ${this.y})`;
  }

  debugDraw(color: string) {
    const ctx: CanvasRenderingContext2D = window.scene.debugContext;
    ctx.beginPath();
    ctx.moveTo(this.x - 3, this.y - 3);
    ctx.lineTo(this.x + 3, this.y + 3);
    ctx.moveTo(this.x - 3, this.y + 3);
    ctx.lineTo(this.x + 3, this.y - 3);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  angleBetween(other: Vector2): number {
    return other.subtract(this).angle;
  }

  distanceTo(other: Vector2): number {
    return other.subtract(this).magnitude;
  }

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  scale(factor: number): Vector2 {
    return new Vector2(this.x * factor, this.y * factor);
  }

  withMagnitude(magnitude: number): Vector2 {
    return this.scale(magnitude / this.magnitude);
  }

  normal(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  invert(): Vector2 {
    return this.scale(-1);
  }

  equals(other: Vector2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  lineThrough(other: Vector2): Line2 {
    return new Line2(this, other);
  }
}
