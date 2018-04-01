// @flow
import Pulse from '../effects/Pulse';
import Circle from '../geom/Circle';
import type Vector2 from '../geom/Vector2';
import SceneObject from '../render/SceneObject';
import ShapeHelpers from '../render/ShapeHelpers';
import { TEAL } from '../colors';
import { outSine } from '../easings';
import { mapRange, constrain } from '../util';
import ConnectionSet from './ConnectionSet';
import type { ConnectionDirection } from './ConnectionSet';
import Traveller from './Traveller';
import Road from './Road';
import type { NetworkNode, Connectable } from './interfaces';

const DEFAULT_COOLDOWN = 1000;

const RADIUS = 20;
const VISUAL_CONNECTION_RADIUS = 30;
const CLOCK_RADIUS = RADIUS * 0.7;
const PULSE_RADIUS = 35;

const PULSE_DURATION = 500;
const CLOCK_FADE_DURATION = 150;

const MAIN_COLOR = TEAL.lighten(0.1);
const CLOCK_COLOR = TEAL.darken(0.1);
const PULSE_COLOR = TEAL.lighten(0.2).fade(0.1);

export default class Producer extends SceneObject implements NetworkNode {
  _circle: Circle;
  _visualConnectionCircle: Circle;
  _cooldown: number;
  _timer: number;
  _connectionSet: ConnectionSet = new ConnectionSet();

  constructor(x: number, y: number, cooldown: number = DEFAULT_COOLDOWN) {
    super();
    this._circle = new Circle(x, y, RADIUS);
    this._visualConnectionCircle = new Circle(x, y, VISUAL_CONNECTION_RADIUS);
    this._cooldown = cooldown;
    this._timer = 0;
  }

  get position(): Vector2 {
    return this._circle.center;
  }

  getVisualConnectionPointAtAngle(radians: number): Vector2 {
    return this._visualConnectionCircle.pointOnCircumference(radians);
  }

  connectTo(node: Connectable, direction: ConnectionDirection) {
    this._connectionSet.add(node, direction);
  }

  update(delta: number) {
    this._timer += delta;
    if (this._timer > this._cooldown) {
      this._timer -= this._cooldown;

      this._onTimerEnd();
    }
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
    ctx.fillStyle = bgColor.toString();
    ShapeHelpers.circle(
      ctx,
      this._circle.center.x,
      this._circle.center.y,
      this._circle.radius,
    );
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = CLOCK_COLOR.toString();
    ctx.moveTo(this._circle.center.x, this._circle.center.y);
    ctx.arc(
      this._circle.center.x,
      this._circle.center.y,
      this._circle.radius,
      -Math.PI / 2,
      progress * 2 * Math.PI - Math.PI / 2,
      false,
    );
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = MAIN_COLOR.toString();
    ShapeHelpers.circle(
      ctx,
      this._circle.center.x,
      this._circle.center.y,
      CLOCK_RADIUS,
    );
    ctx.fill();
  }

  _onTimerEnd() {
    this._pulse();
    this._emitTraveller();
  }

  _pulse() {
    this.getScene().addChildBefore(
      this,
      new Pulse({
        x: this._circle.center.x,
        y: this._circle.center.y,
        startRadius: RADIUS,
        endRadius: PULSE_RADIUS,
        duration: PULSE_DURATION,
        color: PULSE_COLOR,
        ease: outSine,
        removeOnComplete: true,
      }),
    );
  }

  _emitTraveller() {
    const traveller = new Traveller();
    const road = this._connectionSet.sampleOutgoing();
    if (!(road instanceof Road)) return;
    road.addTravellerAtStart(traveller);
    this.getScene().addChild(traveller);
  }
}
