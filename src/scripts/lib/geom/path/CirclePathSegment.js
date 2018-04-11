// @flow
import { constrain, mapRange } from '../../util';
import Vector2 from '../Vector2';
import Circle from '../Circle';
import type { PathSegment } from './Path';
import StraightPathSegment from './StraightPathSegment';
import Line2 from '../Line2';

export default class CirclePathSegment implements PathSegment {
  static withinCircle(
    containingCircle: Circle,
    entryAngle: number,
    exitAngle: number,
  ): CirclePathSegment | StraightPathSegment {
    entryAngle = entryAngle + Math.PI;
    const entryPoint = containingCircle.pointOnCircumference(entryAngle);
    const exitPoint = containingCircle.pointOnCircumference(exitAngle);

    const entryLineNormal = new Line2(
      containingCircle.center,
      entryPoint,
    ).perpendicularLineThroughPoint(entryPoint);
    const exitLineNormal = new Line2(
      containingCircle.center,
      exitPoint,
    ).perpendicularLineThroughPoint(exitPoint);

    if (entryLineNormal.isPerpendicularTo(exitLineNormal)) {
      return new StraightPathSegment(entryPoint, exitPoint);
    }

    const roadCircleCenter = entryLineNormal.pointAtIntersectionWith(
      exitLineNormal,
    );
    const roadCircleRadius = entryPoint.distanceTo(roadCircleCenter);

    // containingCircle.center.debugDraw('lime');
    // roadCircleCenter.debugDraw('blue');
    // entryPoint.debugDraw('magenta');
    // exitPoint.debugDraw('red');

    return new CirclePathSegment(
      roadCircleCenter,
      roadCircleRadius,
      entryPoint.subtract(roadCircleCenter).angle,
      exitPoint.subtract(roadCircleCenter).angle,
    );
  }

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
    const angle = this.getAngleAtPosition(position) + Math.PI / 2;
    return this.circle.pointOnCircumference(angle);
  }

  getAngleAtPosition(position: number): number {
    return (
      mapRange(
        0,
        this.length,
        this.startAngle,
        this.startAngle + this.angleDifference,
        constrain(0, this.length, position),
      ) -
      Math.PI / 2
    );
  }
}
