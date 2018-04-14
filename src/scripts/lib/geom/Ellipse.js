// @flow
import Vector2 from './Vector2';

export default class Ellipse {
  center: Vector2;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.center = new Vector2(x, y);
    this.width = width;
    this.height = height;
  }

  debugDraw(color: string) {
    const ctx: CanvasRenderingContext2D = window.debugContext;
    ctx.beginPath();
    ctx.ellipse(
      this.center.x,
      this.center.y,
      this.width / 2,
      this.height / 2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.lineWidth = window.HAIRLINE;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  pointOnCircumference(radians: number): Vector2 {
    return new Vector2(
      this.center.x + Math.cos(radians) * (this.width / 2),
      this.center.y + Math.sin(radians) * (this.height / 2),
    );
  }

  move(amt: Vector2): Ellipse {
    const center = this.center.add(amt);
    return new Ellipse(center.x, center.y, this.width, this.height);
  }
}
