// @flow
import SceneObject from '../lib/core/SceneObject';
import Vector2 from '../lib/geom/Vector2';
import Ellipse from '../lib/geom/Ellipse';
import ShapeHelpers from '../lib/ShapeHelpers';
import { constrain } from '../lib/util';
import { BLUE } from '../colors';

const RADIUS = 7;
const HIP_HEIGHT = 3;
const ELLIPSE_Y_SCALE = 0.3;
const LEG_WIDTH = 1.5;
const LEG_LENGTH = 6;
const KNEE_POSITION = 0.5;
const KNEE_SCALE = 1.2;
const LEG_MAX_LIFT = 0.3;
const KNEE_MAX_OUT = 1;

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
const DETAIL_COLOR = BLUE.darken(0.3);
const LEG_COLOR = BLUE;

const HALF_PI = Math.PI / 2;

const LEG_SPACE =
  (Math.sqrt(RADIUS * RADIUS - (RADIUS - HIP_HEIGHT) * (RADIUS - HIP_HEIGHT)) -
    LEG_WIDTH) *
  2;

const normaliseAngle = (angle: number): number =>
  Math.atan2(Math.sin(angle), Math.cos(angle));

const getHipsEllipse = (center: Vector2): Ellipse => {
  return new Ellipse(
    center.x,
    center.y + (RADIUS - HIP_HEIGHT),
    LEG_SPACE,
    LEG_SPACE * ELLIPSE_Y_SCALE,
  );
};

const getFloorEllipse = (center: Vector2): Ellipse => {
  return new Ellipse(
    center.x,
    center.y + (RADIUS - HIP_HEIGHT) + LEG_LENGTH,
    LEG_SPACE,
    LEG_SPACE * ELLIPSE_Y_SCALE,
  );
};

const getKneesEllipse = (center: Vector2): Ellipse => {
  return new Ellipse(
    center.x,
    center.y + (RADIUS - HIP_HEIGHT) + LEG_LENGTH * KNEE_POSITION,
    LEG_SPACE * KNEE_SCALE,
    LEG_SPACE * KNEE_SCALE * ELLIPSE_Y_SCALE,
  );
};

export default class Pal extends SceneObject {
  position: Vector2;
  velocity: Vector2;
  _hipEllipse: Ellipse;
  _kneeEllipse: Ellipse;
  _offsetEllipse: Ellipse;
  _floorEllipse: Ellipse;
  _heading: number = 0;
  _rightLegLift: number = 0;
  _leftLegLift: number = 0;
  _t: number = 0;

  constructor(x: number, y: number) {
    super();
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);

    this._hipEllipse = getHipsEllipse(this.position);
    this._kneeEllipse = getKneesEllipse(this.position);
    this._offsetEllipse = this._hipEllipse.move(
      this._hipEllipse.center.scale(-1),
    );
    this._floorEllipse = getFloorEllipse(this.position);
    this._heading = Math.PI / 2;
  }

  get _headingVec(): Vector2 {
    return Vector2.fromMagnitudeAndAngle(1, this._heading);
  }

  update(dt: number) {
    this._heading += dt / 1000;
    this._t += dt;
    this._rightLegLift = constrain(0, 1, Math.sin(this._t / 100));
    this._leftLegLift = constrain(0, 1, Math.sin(-this._t / 100));
  }

  _debugDraw() {
    this._hipEllipse.debugDraw('lime');
    this._floorEllipse.debugDraw('cyan');
    this._kneeEllipse.debugDraw('red');
    this._floorEllipse.center.debugDraw('magenta');
    this._floorEllipse.pointOnCircumference(this._heading).debugDraw('magenta');
  }

  draw(ctx: CanvasRenderingContext2D) {
    const heading = normaliseAngle(this._heading);

    if (Math.abs(heading) < Math.PI / 2) {
      this._drawRightLeg(ctx);
      this._drawBod(ctx);
      this._drawLeftLeg(ctx);
    } else {
      this._drawLeftLeg(ctx);
      this._drawBod(ctx);
      this._drawRightLeg(ctx);
    }
  }

  _drawBod(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ShapeHelpers.circle(ctx, this.position.x, this.position.y, RADIUS);
    ctx.fillStyle = BOD_COLOR.toString();
    ctx.fill();
    ctx.clip();

    const faceX = normaliseAngle(HALF_PI - this._heading) / HALF_PI * RADIUS;

    // EYES
    ctx.beginPath();
    ShapeHelpers.circle(
      ctx,
      faceX + this.position.x + EYE_X,
      this.position.y - EYE_Y,
      EYE_RADIUS,
    );
    ShapeHelpers.circle(
      ctx,
      faceX + this.position.x - EYE_X,
      this.position.y - EYE_Y,
      EYE_RADIUS,
    );
    ctx.fillStyle = DETAIL_COLOR.toString();
    ctx.fill();

    // MOUTH
    ctx.beginPath();
    ctx.moveTo(
      faceX + this.position.x - MOUTH_WIDTH,
      this.position.y - MOUTH_Y,
    );
    ctx.quadraticCurveTo(
      faceX + this.position.x,
      this.position.y - MOUTH_Y + MOUNT_SMILE,
      faceX + this.position.x + MOUTH_WIDTH,
      this.position.y - MOUTH_Y,
    );
    ctx.lineWidth = MOUTH_THICKNESS;
    ctx.strokeStyle = DETAIL_COLOR.toString();
    ctx.stroke();

    // BUTT
    const butt1X = faceX + RADIUS * 2;
    const butt2X = faceX - RADIUS * 2;
    ctx.beginPath();
    this._makeButtLine(ctx, faceX + RADIUS * 2);
    this._makeButtLine(ctx, faceX - RADIUS * 2);
    ctx.lineWidth = BUTT_THICKNESS;
    ctx.strokeStyle = DETAIL_COLOR.toString();
    ctx.stroke();

    ctx.restore();
  }

  _makeButtLine(ctx: CanvasRenderingContext2D, buttX: number) {
    ctx.moveTo(buttX * 1.8 + this.position.x, this.position.y + BUTT_TOP);
    ctx.quadraticCurveTo(
      buttX * 1.6 + this.position.x,
      this.position.y + (BUTT_TOP + BUTT_BOTTOM) * 0.6,
      buttX + this.position.x,
      this.position.y + BUTT_BOTTOM,
    );
  }

  _drawRightLeg(ctx: CanvasRenderingContext2D) {
    this._drawLeg(ctx, -Math.PI / 2, this._rightLegLift);
  }

  _drawLeftLeg(ctx: CanvasRenderingContext2D) {
    this._drawLeg(ctx, Math.PI / 2, this._leftLegLift);
  }

  _drawLeg(ctx: CanvasRenderingContext2D, offsetAngle: number, lift: number) {
    ctx.beginPath();
    const legAngle = this._heading + offsetAngle;

    const footMove = new Vector2(0, LEG_LENGTH * LEG_MAX_LIFT * lift * -1);
    const kneeMove = footMove
      .scale(KNEE_POSITION)
      .add(
        this._offsetEllipse
          .pointOnCircumference(this._heading)
          .scale(KNEE_MAX_OUT * lift),
      );

    const hip = this._hipEllipse.pointOnCircumference(legAngle);
    const knee = this._kneeEllipse
      .move(kneeMove)
      .pointOnCircumference(legAngle);
    const foot = this._floorEllipse
      .move(footMove)
      .pointOnCircumference(legAngle);

    // hip.debugDraw('lime');
    // knee.debugDraw('cyan');
    // foot.debugDraw('red');

    ctx.moveTo(hip.x, hip.y);
    ctx.quadraticCurveTo(knee.x, knee.y, foot.x, foot.y);
    ctx.lineCap = 'round';
    ctx.strokeStyle = LEG_COLOR.toString();
    ctx.lineWidth = LEG_WIDTH;
    ctx.stroke();
  }
}
