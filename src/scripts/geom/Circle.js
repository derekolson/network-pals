// @flow
import Point from './Point';

export default class Circle {
  center: Point;
  radius: number;

  constructor(x: number, y: number, radius: number) {
    this.center = new Point(x, y);
    this.radius = radius;
  }
}
