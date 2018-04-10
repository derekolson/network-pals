// @flow
import Vector2 from './Vector2';

export default class Circle {
  center: Vector2;
  radius: number;

  constructor(x: number, y: number, radius: number) {
    this.center = new Vector2(x, y);
    this.radius = radius;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  pointOnCircumference(radians: number) {
    return new Vector2(
      this.center.x + Math.cos(radians) * this.radius,
      this.center.y + Math.sin(radians) * this.radius,
    );
  }
}
