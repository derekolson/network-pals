// @flow
import SceneObject from '../lib/core/SceneObject';
import Vector2 from '../lib/geom/Vector2';
import Circle from '../lib/geom/Circle';
import ShapeHelpers from '../lib/ShapeHelpers';
import { constrain, normaliseAngle } from '../lib/util';
import { BLUE } from '../colors';
import PalLeg from './PalLeg';

const RADIUS = 7;

const EYE_Y = 3;
const EYE_X = 2.5;
const EYE_RADIUS = 1;
const MOUTH_THICKNESS = 1;
const MOUTH_Y = 1;
const MOUTH_WIDTH = 4;
const MOUNT_SMILE = 2;
const BUTT_TOP = 3;
const BUTT_BOTTOM = 6;
const BUTT_THICKNESS = 0.7;

const BOD_COLOR = BLUE.lighten(0.2);
const FACE_COLOR = BLUE.darken(0.3);
const BUTT_COLOR = BLUE.darken(0.1);

const MAX_SPEED = 80;
const ACCELERATION = 100;
const DECELERATION = 100;

const HALF_PI = Math.PI / 2;

export default class Pal extends SceneObject {
  _target: Vector2;
  _heading: number = 0;
  _speed: number = 0;
  _headingVelocity: number = 0;
  position: Vector2;

  _leftLeg: PalLeg;
  _rightLeg: PalLeg;

  constructor(x: number, y: number) {
    super();
    this.position = new Vector2(x, y);
    this._target = new Vector2(x, y);
    this._heading = Math.PI / 2;
    this._leftLeg = new PalLeg(this, Math.PI / 2);
    this._rightLeg = new PalLeg(this, -Math.PI / 2);
  }

  get bod(): Circle {
    return new Circle(this.position.x, this.position.y - 12, RADIUS);
  }

  get heading(): number {
    return this._heading;
  }

  get _headingVec(): Vector2 {
    return Vector2.fromMagnitudeAndAngle(1, this._heading);
  }

  get velocity(): Vector2 {
    return this._headingVec.scale(this._speed);
  }

  get headingVelocity(): number {
    return this._headingVelocity;
  }

  setTarget(x: number, y: number) {
    this._target = new Vector2(x, y);
  }

  canLiftLeg(leg: PalLeg): boolean {
    if (leg === this._rightLeg) return !this._leftLeg.isStepping;
    if (leg === this._leftLeg) return !this._rightLeg.isStepping;
    throw new Error('whos leg even is this');
  }

  update(dtMilliseconds: number) {
    const dtSeconds = dtMilliseconds / 1000;
    const angleToTarget = this.position.angleBetween(this._target);
    const angleDelta = normaliseAngle(angleToTarget - this._heading);
    const lastHeading = this._heading;
    this._heading += angleDelta / 10;
    this._headingVelocity =
      normaliseAngle(this._heading - lastHeading) / dtSeconds;

    const distance = this._target.distanceTo(this.position);
    if (distance > 25) {
      this._accelerate(ACCELERATION, dtSeconds);
    } else {
      this._accelerate(-DECELERATION, dtSeconds);
    }

    this._leftLeg.update(dtSeconds);
    this._rightLeg.update(dtSeconds);
  }

  _accelerate(amt: number, dtSeconds: number) {
    const lastSpeed = this._speed;
    this._speed = constrain(0, MAX_SPEED, this._speed + amt * dtSeconds);
    const avgSpeed = (lastSpeed + this._speed) / 2;
    this.position = this.position.add(
      Vector2.fromMagnitudeAndAngle(avgSpeed * dtSeconds, this._heading),
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const heading = normaliseAngle(this._heading);

    ctx.beginPath();
    ctx.ellipse(
      this.position.x,
      this.position.y,
      this.bod.radius * 0.8,
      this.bod.radius * 0.8 * 0.3,
      0,
      0,
      2 * Math.PI,
    );
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fill();

    if (Math.abs(heading) < Math.PI / 2) {
      this._rightLeg.draw(ctx);
      this._drawBod(ctx);
      this._leftLeg.draw(ctx);
    } else {
      this._leftLeg.draw(ctx);
      this._drawBod(ctx);
      this._rightLeg.draw(ctx);
    }
  }

  _drawBod(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ShapeHelpers.circle(ctx, this.bod.center.x, this.bod.center.y, RADIUS);
    ctx.fillStyle = BOD_COLOR.toString();
    ctx.fill();
    ctx.clip();

    const faceX = normaliseAngle(HALF_PI - this._heading) / HALF_PI * RADIUS;

    // EYES
    ctx.beginPath();
    ShapeHelpers.circle(
      ctx,
      faceX + this.bod.center.x + EYE_X,
      this.bod.center.y - EYE_Y,
      EYE_RADIUS,
    );
    ShapeHelpers.circle(
      ctx,
      faceX + this.bod.center.x - EYE_X,
      this.bod.center.y - EYE_Y,
      EYE_RADIUS,
    );
    ctx.fillStyle = FACE_COLOR.toString();
    ctx.fill();

    // MOUTH
    ctx.beginPath();
    ctx.moveTo(
      faceX + this.bod.center.x - MOUTH_WIDTH,
      this.bod.center.y - MOUTH_Y,
    );
    ctx.quadraticCurveTo(
      faceX + this.bod.center.x,
      this.bod.center.y - MOUTH_Y + MOUNT_SMILE,
      faceX + this.bod.center.x + MOUTH_WIDTH,
      this.bod.center.y - MOUTH_Y,
    );
    ctx.lineWidth = MOUTH_THICKNESS;
    ctx.strokeStyle = FACE_COLOR.toString();
    ctx.stroke();

    // BUTT
    ctx.beginPath();
    this._makeButtLine(ctx, faceX + RADIUS * 2);
    this._makeButtLine(ctx, faceX - RADIUS * 2);
    ctx.lineWidth = BUTT_THICKNESS;
    ctx.strokeStyle = BUTT_COLOR.toString();
    ctx.stroke();

    ctx.restore();
  }

  _makeButtLine(ctx: CanvasRenderingContext2D, buttX: number) {
    ctx.moveTo(buttX * 1.6 + this.bod.center.x, this.bod.center.y + BUTT_TOP);
    ctx.quadraticCurveTo(
      buttX * 1.7 + this.bod.center.x,
      this.bod.center.y + (BUTT_TOP + BUTT_BOTTOM) * 0.65,
      buttX + this.bod.center.x,
      this.bod.center.y + BUTT_BOTTOM,
    );
  }
}
