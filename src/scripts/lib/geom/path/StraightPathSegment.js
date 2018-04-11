// @flow
import { constrain } from '../../util';
import Vector2 from '../Vector2';
import Line2 from '../Line2';
import type { PathSegment } from './Path';

export default class StraightPathSegment implements PathSegment {
  line: Line2;

  constructor(start: Vector2, end: Vector2) {
    this.line = new Line2(start, end);
    Object.freeze(this);
  }

  get start(): Vector2 {
    return this.line.start;
  }

  get end(): Vector2 {
    return this.line.end;
  }

  get delta(): Vector2 {
    return this.end.subtract(this.start);
  }

  get length(): number {
    return this.delta.magnitude;
  }

  get angle(): number {
    return this.delta.angle;
  }

  getPointAtPosition(position: number): Vector2 {
    const constrainedPosition = constrain(0, this.length, position);
    return this.delta.withMagnitude(constrainedPosition).add(this.start);
  }

  getAngleAtPosition(): number {
    return this.delta.angle;
  }
}
