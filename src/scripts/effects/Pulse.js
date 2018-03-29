// @flow
import type Color from 'color';
import SceneObject from '../render/SceneObject';
import ShapeHelpers from '../render/ShapeHelpers';
import Circle from '../geom/Circle';
import { linear } from '../easings';
import { lerp } from '../util';

type PulseOptions = {
  x: number,
  y: number,
  startRadius: number,
  endRadius: number,
  duration: number,
  color: Color,
  ease?: number => number,
  removeOnComplete?: boolean,
};

export default class Pulse extends SceneObject {
  _circle: Circle;
  _startRadius: number;
  _endRadius: number;
  _duration: number;
  _color: Color;
  _progress: number;
  _ease: number => number;
  _removeOnComplete: boolean;

  constructor({
    x,
    y,
    startRadius,
    endRadius,
    duration,
    color,
    ease = linear,
    removeOnComplete = false,
  }: PulseOptions) {
    super();
    this._circle = new Circle(x, y, startRadius);
    this._startRadius = startRadius;
    this._endRadius = endRadius;
    this._duration = duration;
    this._color = color;
    this._progress = 0;
    this._ease = ease;
    this._removeOnComplete = removeOnComplete;
  }

  update(deltaTime: number) {
    const deltaProgress = deltaTime / this._duration;
    this._progress = Math.min(1, this._progress + deltaProgress);
    this._circle.radius = lerp(
      this._startRadius,
      this._endRadius,
      this._ease(this._progress),
    );

    if (this._progress === 1 && this._removeOnComplete) {
      this.getScene().removeChild(this);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this._color.fade(this._progress).toString();
    ShapeHelpers.circle(
      ctx,
      this._circle.center.x,
      this._circle.center.y,
      this._circle.radius,
    );
    ctx.fill();
  }
}
