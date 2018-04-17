// @flow
import Ellipse from '../lib/geom/Ellipse';
import Vector2 from '../lib/geom/Vector2';
import { normaliseAngle, constrain } from '../lib/util';
import { BLUE } from '../colors';
import type Pal from './Pal';

const HIP_HEIGHT = 3;
const ELLIPSE_Y_SCALE = 0.3;
const LEG_WIDTH = 1.5;
const LEG_LENGTH = 6;
const KNEE_POSITION = 0.5;
const KNEE_SCALE = 1.2;
const LEG_MAX_LIFT = 0.3;
const KNEE_MAX_OUT = 1;
// const STEP_DURATION = 300;
const BASE_COLOR = BLUE.lighten(0.2);
const DARK_COLOR = BLUE;

const HALF_PI = Math.PI / 2;

const getLegSpace = radius =>
  (Math.sqrt(radius * radius - (radius - HIP_HEIGHT) * (radius - HIP_HEIGHT)) -
    LEG_WIDTH) *
  2;

const getHipsEllipse = (radius: number): Ellipse => {
  return new Ellipse(
    0,
    radius - HIP_HEIGHT,
    getLegSpace(radius),
    getLegSpace(radius) * ELLIPSE_Y_SCALE,
  );
};

const getFloorEllipse = (radius: number): Ellipse => {
  return new Ellipse(
    0,
    radius - HIP_HEIGHT + LEG_LENGTH,
    getLegSpace(radius),
    getLegSpace(radius) * ELLIPSE_Y_SCALE,
  );
};

const getKneesEllipse = (radius: number): Ellipse => {
  return new Ellipse(
    0,
    radius - HIP_HEIGHT + LEG_LENGTH * KNEE_POSITION,
    getLegSpace(radius) * KNEE_SCALE,
    getLegSpace(radius) * KNEE_SCALE * ELLIPSE_Y_SCALE,
  );
};

export default class PalLeg {
  _pal: Pal;
  _angleOffset: number;
  _hipEllipse: Ellipse;
  _kneeEllipse: Ellipse;
  _offsetEllipse: Ellipse;
  _floorEllipse: Ellipse;
  _liftAmt: number = 0;
  _lastFloorPosition: Vector2;

  constructor(pal: Pal, angleOffset: number) {
    this._pal = pal;
    this._angleOffset = angleOffset;

    this._hipEllipse = getHipsEllipse(this._pal.bod.radius);
    this._kneeEllipse = getKneesEllipse(this._pal.bod.radius);
    this._offsetEllipse = this._hipEllipse.move(
      this._hipEllipse.center.scale(-1),
    );
    this._floorEllipse = getFloorEllipse(this._pal.bod.radius);

    // this._lastFloorPosition = this._getFloorPosition();
  }

  get angle(): number {
    return this._pal.heading + this._angleOffset;
  }

  update(dtSeconds: number, headingVelocity: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();

    // hip.debugDraw('lime');
    // knee.debugDraw('cyan');
    // foot.debugDraw('red');

    const colorDarkenAmount = constrain(
      0,
      1,
      Math.abs(normaliseAngle(-HALF_PI - this.angle) / HALF_PI),
    );
    const legColor = BASE_COLOR.mix(
      DARK_COLOR,
      1 - colorDarkenAmount * colorDarkenAmount,
    );

    const hip = this._getCurrentHipPosition();
    const knee = this._getCurrentKneePosition();
    const foot = this._getCurrentFootPosition();

    ctx.moveTo(hip.x, hip.y);
    ctx.quadraticCurveTo(knee.x, knee.y, foot.x, foot.y);
    ctx.lineCap = 'round';
    ctx.strokeStyle = legColor.toString();
    ctx.lineWidth = LEG_WIDTH;
    ctx.stroke();
  }

  _debugDraw() {
    this._hipEllipse.move(this._pal.bod.center).debugDraw('lime');
    this._floorEllipse.move(this._pal.bod.center).debugDraw('cyan');
    this._kneeEllipse.move(this._pal.bod.center).debugDraw('red');
    this._floorEllipse.center.add(this._pal.bod.center).debugDraw('magenta');
    this._floorEllipse
      .move(this._pal.bod.center)
      .pointOnCircumference(this._pal.heading)
      .debugDraw('magenta');
  }

  _getIdealFloorPosition(): Vector2 {
    return this._floorEllipse
      .pointOnCircumference(this.angle)
      .add(this._pal.bod.center);
  }

  _getFootLiftVector(): Vector2 {
    return new Vector2(0, LEG_LENGTH * LEG_MAX_LIFT * this._liftAmt * -1);
  }

  _getCurrentFootPosition(): Vector2 {
    return this._floorEllipse
      .move(this._getFootLiftVector())
      .pointOnCircumference(this.angle)
      .add(this._pal.bod.center);
  }

  _getCurrentKneePosition(): Vector2 {
    const kneeOffset = this._getFootLiftVector()
      .scale(KNEE_POSITION)
      .add(
        this._offsetEllipse
          .pointOnCircumference(this._pal.heading)
          .scale(KNEE_MAX_OUT * this._liftAmt),
      );

    return this._kneeEllipse
      .move(kneeOffset)
      .pointOnCircumference(this.angle)
      .add(this._pal.bod.center);
  }

  _getCurrentHipPosition(): Vector2 {
    return this._hipEllipse
      .pointOnCircumference(this.angle)
      .add(this._pal.bod.center);
  }
}
