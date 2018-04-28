// @flow
// import Ellipse from '../lib/geom/Ellipse';
import Vector2 from '../lib/geom/Vector2';
import { normaliseAngle, constrain, lerp } from '../lib/util';
import { BLUE } from '../colors';
import type Pal from './Pal';

const HIP_HEIGHT = 3;
const Y_SCALE = 0.3;
const LEG_WIDTH = 1.5;
// const LEG_LENGTH = 6;
// const KNEE_POSITION = 0.5;
const KNEE_SCALE = 1.3;
const LEG_MAX_LIFT = 0.4;
const KNEE_MAX_OUT = 5;
const STEP_DURATION = 0.1;
const REST_DURATION = 0.01;
const STEP_THRESHOLD = 2;
const BASE_COLOR = BLUE.lighten(0.2);
const DARK_COLOR = BLUE;

const HALF_PI = Math.PI / 2;

const getLegRadius = radius =>
  Math.sqrt(radius * radius - (radius - HIP_HEIGHT) * (radius - HIP_HEIGHT)) -
  LEG_WIDTH;

export default class PalLeg {
  _pal: Pal;
  _angleOffset: number;
  _hipRadius: number;
  _kneeRadius: number;
  _floorRadius: number;
  _lastFootOnFloorXY: Vector2;
  _lastFootOnFloorPalPosition: Vector2;
  _stepProgress: number = 0;
  _restTimer: number = 0;

  constructor(pal: Pal, angleOffset: number) {
    this._pal = pal;
    this._angleOffset = angleOffset;
    this._hipRadius = getLegRadius(pal.bod.radius);
    this._kneeRadius = getLegRadius(pal.bod.radius) * KNEE_SCALE;
    this._floorRadius = getLegRadius(pal.bod.radius);

    this._lastFootOnFloorXY = this._getIdealFootRestingXY();
    this._lastFootOnFloorPalPosition = this._pal.position;
  }

  get angle(): number {
    return this._pal.heading + this._angleOffset;
  }

  get isStepping(): boolean {
    return this._stepProgress > 0;
  }

  get isResting(): boolean {
    return this._restTimer > 0;
  }

  update(dtSeconds: number) {
    this._restTimer = constrain(0, REST_DURATION, this._restTimer - dtSeconds);
    if (this.isResting) return;

    if (this.isStepping) {
      this._stepProgress = constrain(
        0,
        1,
        this._stepProgress + dtSeconds / STEP_DURATION,
      );

      if (this._stepProgress === 1) {
        this._lastFootOnFloorXY = this._getCurrentFootXY();
        this._lastFootOnFloorPalPosition = this._pal.position;
        this._stepProgress = 0;
        this._restTimer = REST_DURATION;
      }
    } else {
      const footLeanDistance = this._getCurrentFootXY().distanceTo(
        this._getIdealFootRestingXY(),
      );
      if (footLeanDistance > STEP_THRESHOLD && this._pal.canLiftLeg(this)) {
        this._stepProgress = constrain(
          0,
          1,
          this._stepProgress + dtSeconds / STEP_DURATION,
        );
      }
    }
  }

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

    const hip = this._projectZ(
      this._getCurrentHipXY(),
      this._getCurrentHipZ(),
      this._getCurrentHipOrigin(),
    );
    const knee = this._projectZ(
      this._getCurrentKneeXY(),
      this._getCurrentKneeZ(),
      this._getCurrentKneeOrigin(),
    );
    const foot = this._projectZ(
      this._getCurrentFootXY(),
      this._getCurrentFootZ(),
      this._getCurrentFootOrigin(),
    );

    ctx.moveTo(hip.x, hip.y);
    ctx.quadraticCurveTo(knee.x, knee.y, foot.x, foot.y);
    ctx.lineCap = 'round';
    ctx.strokeStyle = legColor.toString();
    ctx.lineWidth = LEG_WIDTH;
    ctx.stroke();
  }

  _debugDraw() {
    // this._hipEllipse.move(this._pal.bod.center).debugDraw('lime');
    // this._floorEllipse.move(this._pal.bod.center).debugDraw('cyan');
    // this._kneeEllipse.move(this._pal.bod.center).debugDraw('red');
    // this._floorEllipse.center.add(this._pal.bod.center).debugDraw('magenta');
    // this._floorEllipse
    //   .move(this._pal.bod.center)
    //   .pointOnCircumference(this._pal.heading)
    //   .debugDraw('magenta');
  }

  _projectZ(
    xy: Vector2,
    z: number,
    origin: Vector2 = this._pal.position,
  ): Vector2 {
    return new Vector2(xy.x, origin.y - z + (xy.y - origin.y) * Y_SCALE);
  }

  _getIdealFootRestingXY(): Vector2 {
    return this._pal.position.add(
      Vector2.fromMagnitudeAndAngle(
        this._floorRadius,
        this._pal.heading + this._angleOffset,
      ),
    );
  }

  _getPredictedIdealFootXYAtEndOfOfStep(): Vector2 {
    const timeRemaining = (1.5 - this._stepProgress) * STEP_DURATION;

    const predictedPosition = this._pal.velocity
      .scale(timeRemaining)
      .add(this._pal.position);

    const predictedHeading =
      this._pal.heading + this._pal.headingVelocity * timeRemaining;

    return predictedPosition.add(
      Vector2.fromMagnitudeAndAngle(
        this._floorRadius,
        predictedHeading + this._angleOffset,
      ),
    );
  }

  // _getFootLiftVector(): Vector2 {
  //   return new Vector2(0, LEG_LENGTH * LEG_MAX_LIFT * this._liftAmt * -1);
  // }

  _getCurrentFootXY(): Vector2 {
    // console.log('isStepping', this.isStepping);
    if (this.isStepping) {
      const start = this._lastFootOnFloorXY;
      const target = this._getPredictedIdealFootXYAtEndOfOfStep();
      return start.lerp(target, this._stepProgress);
    }

    return this._lastFootOnFloorXY;
  }

  _getFootLiftAmount(): number {
    return Math.sin(this._stepProgress * Math.PI);
  }

  _getCurrentFootZ(): number {
    return lerp(
      0,
      this._getCurrentHipZ() * LEG_MAX_LIFT,
      this._getFootLiftAmount(),
    );
  }

  _getCurrentFootOrigin(): Vector2 {
    if (this.isStepping) {
      return this._lastFootOnFloorPalPosition.lerp(
        this._pal.position,
        this._stepProgress,
      );
    }

    return this._lastFootOnFloorPalPosition;
  }

  _getCurrentKneeXY(): Vector2 {
    return this._pal.position
      .add(
        Vector2.fromMagnitudeAndAngle(
          this._kneeRadius,
          this._pal.heading + this._angleOffset,
        ),
      )
      .add(
        Vector2.fromMagnitudeAndAngle(
          this._getFootLiftAmount() * KNEE_MAX_OUT,
          this._pal.heading,
        ),
      );
  }

  _getCurrentKneeZ(): number {
    return (this._getCurrentFootZ() + this._getCurrentHipZ()) / 2;
  }

  _getCurrentKneeOrigin(): Vector2 {
    return this._getCurrentHipOrigin().lerp(this._getCurrentFootOrigin(), 0.5);
  }

  _getCurrentHipXY(): Vector2 {
    return this._pal.position.add(
      Vector2.fromMagnitudeAndAngle(
        this._hipRadius,
        this._pal.heading + this._angleOffset,
      ),
    );
    // return this._hipEllipse
    //   .pointOnCircumference(this.angle)
    //   .add(this._pal.bod.center);
  }

  _getCurrentHipZ(): number {
    return (
      this._pal.position.y -
      this._pal.bod.center.y -
      (this._pal.bod.radius - HIP_HEIGHT)
    );
  }

  _getCurrentHipOrigin(): Vector2 {
    return this._pal.position;
  }
}
