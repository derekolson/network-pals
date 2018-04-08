// @flow
import invariant from 'invariant';
import SceneObject from '../render/SceneObject';
import ShapeHelpers from '../render/ShapeHelpers';
import { sample, constrain, mapRange, random } from '../util';
import { BLUE } from '../colors';
import { outBack, inBack } from '../easings';
import type Road from './Road';
import type { NetworkNode } from './interfaces';
import Intersection from './Intersection';

const TRAVELLER_COLOR = BLUE.fade(0.4);
const TRAVELLER_RADIUS = 7;
const MIN_TRAVELLER_SAFE_RADIUS = 30;
const MAX_TRAVELLER_SAFE_RADIUS = 30;

const INITIAL_SPEED = 5;
const MAX_SPEED = 100;
const ACCELERATION = 300;
const DECELERATION = -300;
const ROAD_END_OVERSHOOT = 0;

const ENTER_DURATION = 400;
const EXIT_DURATION = 400;

const enterEase = outBack(3);
const exitEase = inBack(3);

let i = 0;

export default class Traveller extends SceneObject {
  comfortableRadius = random(
    MIN_TRAVELLER_SAFE_RADIUS,
    MAX_TRAVELLER_SAFE_RADIUS,
  );
  _currentRoad: Road | null = null;
  _destination: NetworkNode | null = null;
  _positionOnCurrentRoad: number = 0;
  _speed: number = INITIAL_SPEED;
  _age: number = 0;
  _exitStartedAt: number | null = null;
  i = i++;

  get positionOnCurrentRoad(): number {
    return this._positionOnCurrentRoad;
  }

  get distanceToEndOfCurrentRoad(): number {
    invariant(this._currentRoad, 'traveller is not on a road');
    return this._currentRoad.length - this._positionOnCurrentRoad;
  }

  get destination(): NetworkNode | null {
    return this._destination;
  }

  onAddedToRoad(road: Road) {
    this._currentRoad = road;
    this._positionOnCurrentRoad = 0;
    if (!this._destination) {
      this._pickDestination();
    }
  }

  onRemovedFromRoad() {
    this._currentRoad = null;
  }

  onRemovedFromScene() {
    this.removeFromCurrentRoad();
  }

  removeFromCurrentRoad() {
    if (this._currentRoad) this._currentRoad.removeTraveller(this);
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
    ShapeHelpers.circle(ctx, position.x, position.y, TRAVELLER_RADIUS * scale);
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
    const potentialDestinations = this._currentRoad
      .getAllReachableNodes()
      .filter(node => node.isDestination);
    const destination = sample(potentialDestinations);
    this._destination = destination;
  }

  _move(dtMilliseconds: number, currentRoad: Road) {
    const dtSeconds = dtMilliseconds / 1000;

    if (this._shouldDecelerate(currentRoad)) {
      this._accelerate(DECELERATION, dtSeconds, currentRoad);
    } else {
      this._accelerate(ACCELERATION, dtSeconds, currentRoad);
    }
  }

  _shouldDecelerate(currentRoad: Road): boolean {
    const predictedStopPosition = this._getPredictedStopPositionIfDecelerating();
    if (
      currentRoad.to === this._destination &&
      currentRoad.length + ROAD_END_OVERSHOOT < predictedStopPosition
    ) {
      return true;
    }

    const nextTravellerOnRoad = currentRoad.getTravellerAfterPosition(
      this._positionOnCurrentRoad,
    );

    const safeStopAheadPosition =
      predictedStopPosition + this.comfortableRadius;

    if (
      nextTravellerOnRoad &&
      nextTravellerOnRoad.positionOnCurrentRoad < safeStopAheadPosition
    ) {
      return true;
    }

    if (currentRoad.to instanceof Intersection) {
      const intersection = currentRoad.to;
      const outgoingTraveller = intersection.getClosestOutgoingTraveller();
      if (outgoingTraveller) {
        const outgoingTravellerPosition =
          currentRoad.length + outgoingTraveller.positionOnCurrentRoad;

        if (outgoingTravellerPosition < safeStopAheadPosition) return true;
      }

      const incomingTraveller = intersection.getClosestIncomingTraveller();
      if (incomingTraveller && incomingTraveller !== this) {
        const incomingTravellerPosition =
          currentRoad.length - incomingTraveller.distanceToEndOfCurrentRoad;
        if (incomingTravellerPosition < safeStopAheadPosition) return true;
      }
    }

    return false;
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
      this._onReachEndOfCurrentRoad(currentRoad);
    }
  }

  _checkExit() {
    if (this._isExiting && this._age >= this._exitStartedAt + EXIT_DURATION) {
      this._onExit();
    }
  }

  _onReachEndOfCurrentRoad(currentRoad: Road) {
    const nextNode = currentRoad.to;
    const destination = this._destination;
    if (nextNode.canConsumeTraveller) {
      nextNode.consumeTraveller(this);
      if (nextNode === destination) {
        this._onReachDestination();
      }
    }
  }

  _onReachDestination() {
    this._exit();
  }

  _onExit() {
    this.getScene().removeChild(this);
  }

  _exit() {
    this._exitStartedAt = this._age;
  }
}
