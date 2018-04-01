// @flow
import invariant from 'invariant';
import SceneObject from '../render/SceneObject';
import ShapeHelpers from '../render/ShapeHelpers';
import { sample, constrain, mapRange } from '../util';
import { BLUE } from '../colors';
import { outBack, inBack } from '../easings';
import type Road from './Road';
import type { NetworkNode } from './interfaces';

const TRAVELLER_COLOR = BLUE;
const TRAVELLLER_RADIUS = 7;

const INITIAL_SPEED = 20;
const MAX_SPEED = 70;
const ACCELERATION = 20;
const DECELERATION = -40;

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

    this._move(dtMilliseconds, currentRoad);
    this._checkAtEndOfRoad(currentRoad);
    this._checkExit();
  }

  draw(ctx: CanvasRenderingContext2D) {
    const currentRoad = this._currentRoad;
    invariant(currentRoad, 'current road must be defined');

    const position = currentRoad.getPointAtPosition(
      this._positionOnCurrentRoad,
    );

    const scale =
      this._getEnterTransitionScale() * this._getExitTransitionScale();

    ctx.beginPath();
    ctx.fillStyle = TRAVELLER_COLOR.toString();
    ShapeHelpers.circle(ctx, position.x, position.y, TRAVELLLER_RADIUS * scale);
    ctx.fill();
  }

  get _isExiting(): boolean {
    return this._exitStartedAt !== null;
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

  _getPredictedStopPositionIfDecelerating(): number {
    const timeToStop = -this._speed / DECELERATION;
    return (
      this._positionOnCurrentRoad +
      this._speed * timeToStop +
      0.5 * DECELERATION * timeToStop * timeToStop
    );
  }

  _pickDestination() {
    if (!this._currentRoad) return;
    const potentialDestinations = this._currentRoad.getAllDestinations();
    const destination = sample(potentialDestinations);
    this._destination = destination;
  }

  _move(dtMilliseconds: number, currentRoad: Road) {
    const dtSeconds = dtMilliseconds / 1000;

    const stopPosition = this._getPredictedStopPositionIfDecelerating();
    const distanceToEnd = currentRoad.length;
    if (distanceToEnd < stopPosition) {
      this._accelerate(DECELERATION, dtSeconds, currentRoad);
    } else {
      this._accelerate(ACCELERATION, dtSeconds, currentRoad);
    }
  }

  _accelerate(acceleration: number, dtSeconds: number, currentRoad: Road) {
    const lastSpeed = this._speed;
    this._speed = constrain(
      0,
      MAX_SPEED,
      this._speed + acceleration * dtSeconds,
    );
    const avgSpeed = (lastSpeed + this._speed) / 2;
    this._positionOnCurrentRoad = constrain(
      0,
      currentRoad.length,
      this._positionOnCurrentRoad + avgSpeed * dtSeconds,
    );
  }

  _checkAtEndOfRoad(currentRoad: Road) {
    if (this._positionOnCurrentRoad === currentRoad.length) {
      if (this._isExiting) return;
      this._onReachEndOfCurrentRoad();
    }
  }

  _checkExit() {
    if (this._isExiting && this._age >= this._exitStartedAt + EXIT_DURATION) {
      this._onExit();
    }
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
}
