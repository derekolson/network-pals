// @flow
import Vector2 from './Vector2';

export default class Rect {
  center: Vector2;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.center = new Vector2(x, y);
    this.width = width;
    this.height = height;
  }
}
