// @flow
import { compact } from '../util';
import SceneObject from '../render/SceneObject';
import type Scene from '../render/Scene';
import Vector2 from '../geom/Vector2';
import Circle from '../geom/Circle';
import CirclePathSegment from '../geom/path/CirclePathSegment';
import Path from '../geom/path/Path';
import Road from './Road';
import Intersection from './Intersection';
import ConnectionSet from './ConnectionSet';
import type { ConnectionDirection } from './ConnectionSet';

export default class Junction extends SceneObject {
  _circle: Circle;
  _intersectionsByAngle: { [angleString: string]: ?Intersection } = {};
  _incomingIntersections: Set<Intersection> = new Set();
  _outgoingIntersections: Set<Intersection> = new Set();
  _roads: Road[] = [];

  constructor(x: number, y: number, radius: number) {
    super();
    this._circle = new Circle(x, y, radius);
  }

  get position(): Vector2 {
    return this._circle.center;
  }

  onAddedToScene(scene: Scene) {
    super.onAddedToScene(scene);
    this._roads.forEach(road => scene.addChild(road));
  }

  getVisualConnectionPointAtAngle(radians: number): Vector2 {
    return this._circle.pointOnCircumference(radians);
  }

  connectToRoadAtAngle(
    road: Road,
    angle: number,
    direction: ConnectionDirection,
  ): Intersection {
    const intersection = this._intersectionAtAngle(angle);
    intersection.connectTo(road, direction);

    const isIncoming =
      direction === ConnectionSet.IN ||
      this._incomingIntersections.has(intersection);

    const isOutgoing =
      direction === ConnectionSet.OUT ||
      this._outgoingIntersections.has(intersection);

    if (isIncoming) this._incomingIntersections.add(intersection);
    if (isOutgoing) this._outgoingIntersections.add(intersection);

    this._intersections.forEach(other => {
      if (other === intersection) return;

      if (isIncoming && this._outgoingIntersections.has(other)) {
        this._addRoad(new Road(intersection, other));
      }

      if (isOutgoing && this._incomingIntersections.has(other)) {
        this._addRoad(new Road(other, intersection));
      }
    });

    return intersection;
  }

  _intersectionAtAngle(angle: number): Intersection {
    const angleStr = angle.toString();
    if (this._intersectionsByAngle[angleStr]) {
      return this._intersectionsByAngle[angleStr];
    }

    const intersection = this._createIntersectionAtAngle(angle);
    this._intersectionsByAngle[angleStr] = intersection;
    return intersection;
  }

  _createIntersectionAtAngle(angle: number): Intersection {
    const position = this.getVisualConnectionPointAtAngle(angle);
    return new Intersection(position.x, position.y);
  }

  get _intersections(): Intersection[] {
    return compact(
      Object.keys(this._intersectionsByAngle).map(
        angle => this._intersectionsByAngle[angle],
      ),
    );
  }

  _addRoad(road: Road) {
    this._roads.push(road);
    if (this._scene) {
      this._scene.addChild(road);
    }
  }
}
