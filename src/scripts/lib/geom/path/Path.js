// @flow
import invariant from 'invariant';
import { constrain, compact } from '../../util';
import Circle from '../Circle';
import Vector2 from '../Vector2';
import type { Vector2ish } from '../Vector2';
import StraightPathSegment from './StraightPathSegment';
import CirclePathSegment from './CirclePathSegment';

export interface PathSegment {
  +start: Vector2;
  +end: Vector2;
  +length: number;
  getPointAtPosition(position: number): Vector2;
  getAngleAtPosition(position: number): number;
}

export default class Path implements PathSegment {
  static straightThroughPoints(...points: Vector2ish[]): Path {
    let lastPoint = Vector2.from(points.shift());
    const path = new Path();

    points.map(Vector2.from).forEach(point => {
      path.addSegment(new StraightPathSegment(lastPoint, point));
      lastPoint = point;
    });

    return path;
  }

  segments: PathSegment[] = [];

  constructor(...segments: PathSegment[]) {
    this.addSegments(...segments);
  }

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

  getAngleAtPosition(position: number): number {
    const constrained = constrain(0, this.length, position);
    let soFar = 0;
    for (const segment of this.segments) {
      if (constrained <= soFar + segment.length) {
        return segment.getAngleAtPosition(constrained - soFar);
      }
      soFar += segment.length;
    }
    throw new Error('this is supposed to be unreachable oops');
  }

  addSegment(segment: PathSegment): this {
    const lastSegment = this.segments[this.segments.length - 1];
    if (lastSegment) {
      invariant(
        lastSegment.end.equals(segment.start),
        `segments must neatly join together - ${lastSegment.end.toString()} !== ${segment.start.toString()}`,
      );
    }
    this.segments.push(segment);
    return this;
  }

  addSegments(...segments: PathSegment[]): this {
    segments.forEach(segment => this.addSegment(segment));
    return this;
  }

  autoRound(radius: number): this {
    const newSegments = this.segments.map((segment, i): PathSegment | null => {
      const lastSegment = i === 0 ? null : this.segments[i - 1];
      if (!lastSegment) {
        if (segment instanceof StraightPathSegment) return null;
        return segment;
      }

      if (!(segment instanceof StraightPathSegment)) return segment;
      if (!(lastSegment instanceof StraightPathSegment)) return null;

      invariant(lastSegment.end.equals(segment.start), 'segments must join');

      const entryAngle = lastSegment.angle;
      const exitAngle = segment.angle;
      const usableRadius = Math.min(
        radius,
        lastSegment.length / 2,
        segment.length / 2,
      );

      const containingCircle = new Circle(
        segment.start.x,
        segment.start.y,
        usableRadius,
      );

      return CirclePathSegment.withinCircle(
        containingCircle,
        entryAngle,
        exitAngle,
      );
    });

    const compacted = compact(newSegments);

    const start = this.start;
    const end = this.end;
    let lastPoint = start;
    this.segments = [];

    compacted.forEach(segment => {
      if (segment.start.equals(lastPoint)) {
        this.addSegment(segment);
      } else {
        this.addSegment(new StraightPathSegment(lastPoint, segment.start));
        this.addSegment(segment);
      }

      lastPoint = segment.end;
    });

    if (!lastPoint.equals(end)) {
      this.addSegment(new StraightPathSegment(lastPoint, end));
    }

    return this;
  }

  freeze(): this {
    Object.freeze(this);
    return this;
  }
}
