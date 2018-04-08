// @flow
import { constrain, mapRange } from '../../util';
import Vector2 from '../Vector2';
import Circle from '../Circle';
import type { PathSegment } from './Path';

export default class CirclePathSegment implements PathSegment {
  circle: Circle;
  startAngle: number;
  endAngle: number;

  constructor(
    center: Vector2,
    radius: number,
    startAngle: number,
    endAngle: number,
  ) {
    this.circle = new Circle(center.x, center.y, radius);
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    Object.freeze(this);
  }

  get start(): Vector2 {
    return this.circle.pointOnCircumference(this.startAngle);
  }

  get end(): Vector2 {
    return this.circle.pointOnCircumference(this.endAngle);
  }

  get angleDifference(): number {
    return Math.atan2(
      Math.sin(this.endAngle - this.startAngle),
      Math.cos(this.endAngle - this.startAngle),
    );
  }

  get length(): number {
    const proportion = Math.abs(this.angleDifference) / (Math.PI * 2);
    return this.circle.circumference * proportion;
  }

  get isAnticlockwise(): boolean {
    return this.angleDifference < 0;
  }

  getPointAtPosition(position: number): Vector2 {
    const angle = mapRange(
      0,
      this.length,
      this.startAngle,
      this.startAngle + this.angleDifference,
      constrain(0, this.length, position),
    );
    return this.circle.pointOnCircumference(angle);
  }
}
