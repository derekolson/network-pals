// @flow
import Vector2 from './Vector2';

export default class Rect {
  center: Vector2;
  width: number;
  height: number;

  static fromLeftTopRightBottom(
    left: number,
    top: number,
    right: number,
    bottom: number,
  ): Rect {
    const width = right - left;
    const height = bottom - top;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    return new Rect(centerX, centerY, width, height);
  }

  constructor(x: number, y: number, width: number, height: number) {
    this.center = new Vector2(x, y);
    this.width = width;
    this.height = height;
  }

  get left(): number {
    return this.center.x - this.width / 2;
  }

  get top(): number {
    return this.center.y - this.height / 2;
  }

  get right(): number {
    return this.center.x + this.width / 2;
  }

  get bottom(): number {
    return this.center.y + this.height / 2;
  }

  toString(): string {
    return `Rect((${this.left}, ${this.top}), (${this.right}, ${this.bottom}))`;
  }

  debugDraw(color: string) {
    const ctx: CanvasRenderingContext2D = window.scene.debugContext;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(this.left, this.top, this.width, this.height);
  }

  containsPoint(point: Vector2): boolean {
    return !(
      point.x < this.left ||
      point.x > this.right ||
      point.y < this.top ||
      point.y > this.bottom
    );
  }

  intersectsRect(other: Rect): boolean {
    return !(
      this.right < other.left ||
      this.left > other.right ||
      this.bottom < other.top ||
      this.top > other.bottom
    );
  }
}
