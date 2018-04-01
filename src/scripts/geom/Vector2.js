// @flow

export default class Vector2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get magnitudeSquared(): number {
    return this.x * this.x + this.y + this.y;
  }

  get magnitude(): number {
    return Math.sqrt(this.magnitudeSquared);
  }

  angleBetween(other: Vector2): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;

    return Math.atan2(dy, dx);
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
}
