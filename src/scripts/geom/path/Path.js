// @flow
import Vector2 from '../Vector2';
import { constrain } from '../../util';

export interface PathSegment {
  +start: Vector2;
  +end: Vector2;
  +length: number;
  getPointAtPosition(position: number): Vector2;
}

export default class Path implements PathSegment {
  segments: PathSegment[] = [];

  get start(): Vector2 {
    return this.segments[0].start;
  }

  get end(): Vector2 {
    return this.segments[this.segments.length - 1].end;
  }

  get length(): number {
    return this.segments.reduce(
      (length, segment) => length + segment.length,
      0,
    );
  }

  getPointAtPosition(position: number): Vector2 {
    const constrained = constrain(0, this.length, position);
    let soFar = 0;
    for (const segment of this.segments) {
      if (constrained <= soFar + segment.length) {
        return segment.getPointAtPosition(constrained - soFar);
      }
      soFar += segment.length;
    }
    throw new Error('this is supposed to be unreachable oops');
  }

  addSegment(segment: PathSegment): this {
    this.segments.push(segment);
    return this;
  }

  addSegments(...segments: PathSegment[]): this {
    segments.forEach(segment => this.addSegment(segment));
    return this;
  }
}
