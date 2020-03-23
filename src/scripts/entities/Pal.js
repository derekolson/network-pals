// @flow
import invariant from 'invariant';
import type Color from 'color';
import SceneObject from '../lib/core/SceneObject';
import Vector2 from '../lib/geom/Vector2';
import Circle from '../lib/geom/Circle';
import ShapeHelpers from '../lib/ShapeHelpers';
import {
  lerp,
  constrain,
  normaliseAngle,
  varyRelative,
  varyAbsolute,
  random,
  randomInt,
  flatten,
  times,
  shuffle,
} from '../lib/util';
import { BLUE } from '../colors';
import PalLeg from './PalLeg';

// const RADIUS = 14;
// const BOD_HEIGHT = 25;
// const BOD_BOB = 15;

// const EYE_Y = 6;
// const EYE_X = 5;
// const EYE_RADIUS = 2;
// const MOUTH_THICKNESS = 2;
// const MOUTH_Y = 2;
// const MOUTH_WIDTH = 8;
// const MOUNT_SMILE = 4;
// const BUTT_TOP = 6;
// const BUTT_BOTTOM = 12;
// const BUTT_THICKNESS = 1.4;

// const BOD_COLOR = BLUE.lighten(0.2);
// const FACE_COLOR = BLUE.darken(0.3);
// const BUTT_COLOR = BLUE.darken(0.1);

const MAX_SPEED = 100;
const ACCELERATION = 200;
const DECELERATION = 200;

const HALF_PI = Math.PI / 2;

export type PalConfig = {|
  radius: number,
  bodHeight: number,
  bodBob: number,
  eyeY: number,
  eyeX: number,
  eyeRadius: number,
  mouthThickness: number,
  mouthY: number,
  mouthWidth: number,
  mouthSmile: number,
  buttTop: number,
  buttBottom: number,
  buttThickness: number,
  color: Color,
  hipHeight: number,
  kneeScale: number,
  legMaxLift: number,
  kneeMaxOut: number,
  stepDuration: number,
  stepRestDuration: number,
  stepThreshold: number,
  fullStepDistance: number,
  legWidth: number,
  legPairs: number,
|};

// eslint-disable-next-line no-unused-vars
const classicPalConfig: PalConfig = {
  radius: 14,
  bodHeight: 25,
  bodBob: 15,
  eyeY: 6,
  eyeX: 5,
  eyeRadius: 2,
  mouthThickness: 2,
  mouthY: 2,
  mouthWidth: 8,
  mouthSmile: 4,
  buttTop: 6,
  buttBottom: 12,
  buttThickness: 1.4,
  color: BLUE.lighten(0.2),
  hipHeight: 10,
  kneeScale: 1.3,
  legMaxLift: 0.3,
  kneeMaxOut: 14,
  stepDuration: 0.2,
  stepRestDuration: 0.2,
  stepThreshold: 0.2,
  fullStepDistance: 20,
  legWidth: 4,
  legPairs: 1,
};

const generateRandomPalConfig = (): PalConfig => {
  const radius = varyRelative(14, 0.2);
  const hipHeight = varyRelative(radius * 0.7, 0.3);
  const bodHeight = varyRelative(radius * 2, 0.3);
  const legLength = bodHeight - (radius - hipHeight); // typical: 24

  return {
    radius,
    bodHeight,
    bodBob: varyRelative(radius, 0.2),
    eyeY: varyRelative(radius * 0.5, 0.2),
    eyeX: varyRelative(radius * 0.4, 0.3),
    eyeRadius: varyRelative(radius * 0.15, 0.4),
    mouthThickness: varyRelative(radius * 0.15, 0.4),
    mouthY: varyAbsolute(0, radius * 0.2),
    mouthWidth: varyRelative(radius * 0.5, 0.3),
    mouthSmile: varyRelative(radius * 0.3, 0.3),
    buttTop: varyRelative(radius * 0.4, 0.2),
    buttBottom: varyRelative(radius * 0.85, 0.15),
    buttThickness: varyRelative(radius * 0.1, 0.5),
    color: BLUE.lighten(random(-0.2, 0.2))
      .saturate(random(-0.2, 0.2))
      .rotate(random(-10, 10)),
    hipHeight,
    kneeScale: varyAbsolute(1.3, 0.3),
    legMaxLift: random(0.2, 0.5),
    kneeMaxOut: varyRelative(legLength * 0.6, 0.4),
    stepDuration: varyRelative(legLength * 0.01, 0.4),
    stepRestDuration: varyRelative(legLength * 0.0083, 0.4),
    stepThreshold: varyRelative(legLength * 0.01, 0.4),
    fullStepDistance: varyRelative(legLength * 0.7, 0.4),
    legWidth: varyRelative(radius * 0.3, 0.4),
    legPairs: randomInt(1, 2),
  };
};

export default class Pal extends SceneObject {
  _target: Vector2;
  _heading: number = 0;
  _speed: number = 0;
  _headingVelocity: number = 0;
  position: Vector2;
  _config: PalConfig;

  _legs: PalLeg[];

  constructor(
    x: number,
    y: number,
    config: PalConfig = generateRandomPalConfig(),
  ) {
    super();
    this.position = new Vector2(x, y);
    this._config = config;
    this._target = new Vector2(x, y);
    this._heading = Math.PI / 2;

    this._legs = shuffle(
      flatten(
        times(config.legPairs, n => {
          const progress = (n + 1) / (config.legPairs + 1);
          return [
            new PalLeg(this, config, lerp(HALF_PI - 1, HALF_PI + 1, progress)),
            new PalLeg(
              this,
              config,
              lerp(-HALF_PI + 1, -HALF_PI - 1, progress),
            ),
          ];
        }),
      ),
    );
  }

  get bod(): Circle {
    const avgLift = this._legs
      ? this._legs.reduce((sum, leg) => sum + leg.liftAmount, 0) /
        this._legs.length
      : 0;
    const bob = this._config.bodBob * avgLift;

    return new Circle(
      this.position.x,
      this.position.y - this._config.bodHeight - bob,
      this._config.radius,
    );
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

  getCurrentZ(): number {
    return this.position.y;
  }

  canLiftLeg(leg: PalLeg): boolean {
    invariant(this._legs.includes(leg), 'whos leg even is this');
    const enoughLegsOnFloor =
      this._legs.filter(l => l !== leg && !l.isStepping).length >
      Math.floor(Math.log(this._legs.length));

    const anyStepsJustStarted = this._legs.some(
      leg =>
        leg.stepProgress > 0 &&
        leg.stepProgress < 1 / (this._legs.length / 1.5),
    );

    return enoughLegsOnFloor && !anyStepsJustStarted;
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
    if (distance > 15) {
      this._accelerate(ACCELERATION, dtSeconds);
    } else {
      this._accelerate(-DECELERATION, dtSeconds);
    }
    this._legs.forEach(leg => leg.update(dtSeconds));
  }

  updateWithPosition(position: Vector2, heading: number, dtSeconds: number) {
    const lastPosition = this.position;
    const lastHeading = this._heading;

    this._heading = heading;
    this._headingVelocity =
      normaliseAngle(this._heading - lastHeading) / dtSeconds;
    this._speed = lastPosition.distanceTo(position) / dtSeconds;
    this.position = position;
    this._legs.forEach(leg => leg.update(dtSeconds));
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

    ctx.setLineDash([]);
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

    this._legs
      .filter(l => normaliseAngle(l._angleOffset + heading) < 0)
      .forEach(leg => leg.draw(ctx));
    this._legs
      .filter(l => normaliseAngle(l._angleOffset + heading) >= 0)
      .forEach(leg => leg.draw(ctx));
    this._drawBod(ctx);
  }

  _drawBod(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ShapeHelpers.circle(
      ctx,
      this.bod.center.x,
      this.bod.center.y,
      this._config.radius,
    );
    ctx.fillStyle = this._config.color.toString();
    ctx.fill();
    ctx.clip();

    const faceX =
      normaliseAngle(HALF_PI - this._heading) / HALF_PI * this._config.radius;

    // EYES
    ctx.beginPath();
    ShapeHelpers.circle(
      ctx,
      faceX + this.bod.center.x + this._config.eyeX,
      this.bod.center.y - this._config.eyeY,
      this._config.eyeRadius,
    );
    ShapeHelpers.circle(
      ctx,
      faceX + this.bod.center.x - this._config.eyeX,
      this.bod.center.y - this._config.eyeY,
      this._config.eyeRadius,
    );
    ctx.fillStyle = this._config.color.darken(0.5).toString();
    ctx.fill();

    // MOUTH
    ctx.beginPath();
    ctx.moveTo(
      faceX + this.bod.center.x - this._config.mouthWidth,
      this.bod.center.y - this._config.mouthY,
    );
    ctx.quadraticCurveTo(
      faceX + this.bod.center.x,
      this.bod.center.y - this._config.mouthY + this._config.mouthSmile,
      faceX + this.bod.center.x + this._config.mouthWidth,
      this.bod.center.y - this._config.mouthY,
    );
    ctx.lineWidth = this._config.mouthThickness;
    ctx.strokeStyle = this._config.color.darken(0.5).toString();
    ctx.stroke();

    // BUTT
    ctx.beginPath();
    this._makeButtLine(ctx, faceX + this._config.radius * 2);
    this._makeButtLine(ctx, faceX - this._config.radius * 2);
    ctx.lineWidth = this._config.buttThickness;
    ctx.strokeStyle = this._config.color.darken(0.3).toString();
    ctx.stroke();

    ctx.restore();
  }

  _makeButtLine(ctx: CanvasRenderingContext2D, buttX: number) {
    ctx.moveTo(
      buttX * 1.6 + this.bod.center.x,
      this.bod.center.y + this._config.buttTop,
    );
    ctx.quadraticCurveTo(
      buttX * 1.7 + this.bod.center.x,
      this.bod.center.y +
        (this._config.buttTop + this._config.buttBottom) * 0.65,
      buttX + this.bod.center.x,
      this.bod.center.y + this._config.buttBottom,
    );
  }
}
