// @flow
import { constrain } from '../../util';
import Vector2 from '../Vector2';
import type { PathSegment } from './Path';

export default class StraightPathSegment implements PathSegment {
  start: Vector2;
  end: Vector2;
  _difference: Vector2;

  constructor(start: Vector2, end: Vector2) {
    this.start = start;
    this.end = end;
    this._difference = end.subtract(start);
    Object.freeze(this);
  }

  get length(): number {
    return this._difference.magnitude;
  }

  getPointAtPosition(position: number): Vector2 {
    const constrainedPosition = constrain(0, this.length, position);
    return this._difference.withMagnitude(constrainedPosition).add(this.start);
  }
}
