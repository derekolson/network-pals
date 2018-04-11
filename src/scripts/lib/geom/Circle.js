// @flow
import Vector2 from './Vector2';
import Rect from './Rect';

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

  get boundingBox(): Rect {
    return new Rect(
      this.center.x,
      this.center.y,
      this.radius * 2,
      this.radius * 2,
    );
  }

  debugDraw(color: string) {
    const ctx: CanvasRenderingContext2D = window.debugContext;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  pointOnCircumference(radians: number): Vector2 {
    return new Vector2(
      this.center.x + Math.cos(radians) * this.radius,
      this.center.y + Math.sin(radians) * this.radius,
    );
  }

  containsPoint(point: Vector2): boolean {
    return point.distanceTo(this.center) < this.radius;
  }

  intersectsCircle(other: Circle): boolean {
    return this.center.distanceTo(other.center) < this.radius + other.radius;
  }

  withRadius(radius: number): Circle {
    return new Circle(this.center.x, this.center.y, radius);
  }
}
