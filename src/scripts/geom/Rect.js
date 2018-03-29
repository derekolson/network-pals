// @flow
import Point from './Point';

export default class Rect {
  center: Point;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.center = new Point(x, y);
    this.width = width;
    this.height = height;
  }
}
