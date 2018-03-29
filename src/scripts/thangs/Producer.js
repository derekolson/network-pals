// @flow
import SceneObject from '../render/SceneObject';
import ShapeHelpers from '../render/ShapeHelpers';
import Circle from '../geom/Circle';
import Pulse from '../effects/Pulse';
import { mapRange, constrain } from '../util';
import { outSine } from '../easings';
import { TEAL } from '../colors';

const DEFAULT_COOLDOWN = 1000;

const RADIUS = 20;
const CLOCK_RADIUS = RADIUS * 0.7;
const PULSE_RADIUS = 35;

const PULSE_DURATION = 500;
const CLOCK_FADE_DURATION = 150;

const MAIN_COLOR = TEAL.lighten(0.1);
const CLOCK_COLOR = TEAL.darken(0.1);
const PULSE_COLOR = TEAL.lighten(0.2).fade(0.1);

export default class Producer extends SceneObject {
  _geom: Circle;
  _cooldown: number;
  _timer: number;

  constructor(x: number, y: number, cooldown: number = DEFAULT_COOLDOWN) {
    super();
    this._geom = new Circle(x, y, RADIUS);
    this._cooldown = cooldown;
    this._timer = 0;
  }

  update(delta: number) {
    this._timer += delta;
    if (this._timer > this._cooldown) {
      this._timer -= this._cooldown;

      this._onTimerEnd();
    }
  }

  _onTimerEnd() {
    this.getScene().addChildBefore(
      this,
      new Pulse({
        x: this._geom.center.x,
        y: this._geom.center.y,
        startRadius: RADIUS,
        endRadius: PULSE_RADIUS,
        duration: PULSE_DURATION,
        color: PULSE_COLOR,
        ease: outSine,
        removeOnComplete: true,
      }),
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const progress = this._timer / this._cooldown;

    const colorMixAmount = constrain(
      0,
      1,
      mapRange(0, CLOCK_FADE_DURATION, 1, 0, this._timer),
    );
    const bgColor = MAIN_COLOR.mix(CLOCK_COLOR, colorMixAmount);

    ctx.beginPath();
    ctx.fillStyle = bgColor;
    ShapeHelpers.circle(
      ctx,
      this._geom.center.x,
      this._geom.center.y,
      this._geom.radius,
    );
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = CLOCK_COLOR;
    ctx.moveTo(this._geom.center.x, this._geom.center.y);
    ctx.arc(
      this._geom.center.x,
      this._geom.center.y,
      this._geom.radius,
      -Math.PI / 2,
      progress * 2 * Math.PI - Math.PI / 2,
      false,
    );
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = MAIN_COLOR;
    ShapeHelpers.circle(
      ctx,
      this._geom.center.x,
      this._geom.center.y,
      CLOCK_RADIUS,
    );
    ctx.fill();
  }
}
