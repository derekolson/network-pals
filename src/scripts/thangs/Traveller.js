// @flow
import invariant from 'invariant';
import SceneObject from '../render/SceneObject';
import ShapeHelpers from '../render/ShapeHelpers';
import { sample, constrain, mapRange } from '../util';
import { BLUE } from '../colors';
import { outBack, inBack } from '../easings';
import type Road from './Road';
import type Producer from './Producer';
import type { NetworkNode } from './interfaces';

const TRAVELLER_COLOR = BLUE;
const TRAVELLLER_RADIUS = 7;

const INITIAL_SPEED = 20;
const MAX_SPEED = 70;
const ACCELERATION = 20;
// const DECELERATION = 50;

const ENTER_DURATION = 400;
const EXIT_DURATION = 400;

const enterEase = outBack(3);
const exitEase = inBack(3);

let i = 0;

export default class Traveller extends SceneObject {
  _currentRoad: Road | null = null;
  _positionOnCurrentRoad: number = 0;
  _destination: NetworkNode | null = null;
  _speed: number = INITIAL_SPEED;
  _age: number = 0;
  _exitStartedAt: number | null = null;
  i = i++;

  onAddedToRoad(road: Road) {
    this._currentRoad = road;
    this._positionOnCurrentRoad = 0;
    if (!this._destination) {
      this._pickDestination();
    }
  }

  update(dtMilliseconds: number) {
    this._age += dtMilliseconds;

    const currentRoad = this._currentRoad;
    invariant(currentRoad, 'current road must be defined');

    const dtSeconds = dtMilliseconds / 1000;
    const acceleration = ACCELERATION * dtSeconds;
    this._speed = constrain(0, MAX_SPEED, this._speed + acceleration);
    this._positionOnCurrentRoad = constrain(
      0,
      currentRoad.length,
      this._positionOnCurrentRoad + this._speed * dtSeconds,
    );

    if (this._positionOnCurrentRoad === currentRoad.length) {
      if (this._isExiting) return;
      this._onReachEndOfCurrentRoad();
    }

    if (this._isExiting && this._age >= this._exitStartedAt + EXIT_DURATION) {
      this._onExit();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const currentRoad = this._currentRoad;
    invariant(currentRoad, 'current road must be defined');

    const position = currentRoad.getPointAtPosition(
      this._positionOnCurrentRoad,
    );

    const scale =
      this._getEnterTransitionScale() * this._getExitTransitionScale();
    if (this.i === 1) console.log({ scale });

    ctx.beginPath();
    ctx.fillStyle = TRAVELLER_COLOR.toString();
    ShapeHelpers.circle(ctx, position.x, position.y, TRAVELLLER_RADIUS * scale);
    ctx.fill();
  }

  _getEnterTransitionScale() {
    return enterEase(
      constrain(0, 1, mapRange(0, ENTER_DURATION, 0, 1, this._age)),
    );
  }

  _getExitTransitionScale() {
    if (this._exitStartedAt === null) return 1;
    return (
      1 -
      exitEase(
        constrain(
          0,
          1,
          mapRange(
            this._exitStartedAt,
            this._exitStartedAt + EXIT_DURATION,
            0,
            1,
            this._age,
          ),
        ),
      )
    );
  }

  _pickDestination() {
    if (!this._currentRoad) return;
    const potentialDestinations = this._currentRoad.getAllDestinations();
    const destination = sample(potentialDestinations);
    this._destination = destination;
  }

  _onReachEndOfCurrentRoad() {
    this._exit();
  }

  _onExit() {
    this.getScene().removeChild(this);
  }

  _exit() {
    this._exitStartedAt = this._age;
  }

  get _isExiting(): boolean {
    return this._exitStartedAt !== null;
  }
}
