// @flow
import Path from '../geom/path/Path';
import StraightPathSegment from '../geom/path/StraightPathSegment';
import Vector2 from '../geom/Vector2';
import type { Vector2ish } from '../geom/Vector2';
import SceneObject from '../render/SceneObject';
import ShapeHelpers from '../render/ShapeHelpers';
import { YELLOW } from '../colors';
import ConnectionSet from './ConnectionSet';
import Junction from './Junction';
import Traveller from './Traveller';
import type { NetworkNode } from './interfaces';

// const ROAD_OUTER_COLOR = BLUE;
// const ROAD_INNER_COLOR = LIGHT_BG;
const ROAD_DASH_COLOR = YELLOW.lighten(0.1);
// const ROAD_OUTER_WIDTH = 12;
// const ROAD_INNER_WIDTH = 13;
const ROAD_DASH_WIDTH = 4;
const ROAD_DIRECTION_DASH = [5, 10];
const ROAD_DASH_SPEED = 0.05;

export type RoadOptions = {|
  autoRound?: number,
  points?: Vector2ish[],
|};

export default class Road extends SceneObject {
  isNode = false;
  from: NetworkNode;
  to: NetworkNode;
  _path: Path;
  _currentTravellers: Traveller[] = [];

  constructor(
    from: NetworkNode | Junction,
    to: NetworkNode | Junction,
    { points, autoRound }: RoadOptions = {},
  ) {
    super();

    const angleFrom = points
      ? from.position.angleBetween(Vector2.from(points[0]))
      : from.position.angleBetween(to.position);

    const angleTo = points
      ? to.position.angleBetween(Vector2.from(points[points.length - 1]))
      : to.position.angleBetween(from.position);

    if (points) {
      this._path = Path.straightThroughPoints(
        from.getVisualConnectionPointAtAngle(angleFrom),
        ...points,
        to.getVisualConnectionPointAtAngle(angleTo),
      );
    } else {
      this._path = new Path().addSegment(
        new StraightPathSegment(
          from.getVisualConnectionPointAtAngle(angleFrom),
          to.getVisualConnectionPointAtAngle(angleTo),
        ),
      );
    }

    if (autoRound != null) {
      this._path.autoRound(autoRound);
    }

    if (from instanceof Junction) {
      this.from = from.connectToRoadAtAngle(this, angleFrom, ConnectionSet.OUT);
    } else {
      this.from = from;
      from.connectTo(this, ConnectionSet.OUT);
    }

    if (to instanceof Junction) {
      this.to = to.connectToRoadAtAngle(this, angleTo, ConnectionSet.IN);
    } else {
      this.to = to;
      to.connectTo(this, ConnectionSet.IN);
    }
  }

  get length(): number {
    return this._path.length;
  }

  canAddTravellerAtStart(): boolean {
    const nextTraveller = this.getTravellerAfterPosition(0);
    if (!nextTraveller) return true;
    return (
      nextTraveller.positionOnCurrentRoad > nextTraveller.comfortableRadius
    );
  }

  addTravellerAtStart(traveller: Traveller) {
    this._currentTravellers.push(traveller);
    traveller.onAddedToRoad(this);
  }

  removeTraveller(traveller: Traveller): boolean {
    const index = this._currentTravellers.indexOf(traveller);
    if (index === -1) return false;
    this.removeTravellerAtIndex(index);
    return true;
  }

  removeTravellerAtIndex(index: number): Traveller {
    const traveller = this._currentTravellers[index];
    this._currentTravellers.splice(index, 1);
    traveller.onRemovedFromRoad();
    return traveller;
  }

  getAllReachableNodes(visited: Set<NetworkNode> = new Set()): NetworkNode[] {
    const nodes = [];
    if (visited.has(this.to)) return nodes;
    return [...this.to.getAllReachableNodes(visited), this.to];
  }

  getPointAtPosition(position: number): Vector2 {
    return this._path.getPointAtPosition(position);
  }

  getTravellerAfterPosition(position: number): Traveller | null {
    let bestTraveller = null;
    let bestDistance = Infinity;

    this._currentTravellers.forEach(traveller => {
      const distance = traveller.positionOnCurrentRoad - position;
      if (distance <= 0) return;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestTraveller = traveller;
      }
    });

    return bestTraveller;
  }

  getTravellerBeforePosition(position: number): Traveller | null {
    let bestTraveller = null;
    let bestDistance = Infinity;

    this._currentTravellers.forEach(traveller => {
      const distance = position - traveller.positionOnCurrentRoad;
      if (distance <= 0) return;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestTraveller = traveller;
      }
    });

    return bestTraveller;
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ShapeHelpers.path(ctx, this._path);

    // ctx.strokeStyle = ROAD_OUTER_COLOR.toString();
    // ctx.lineWidth = ROAD_OUTER_WIDTH;
    // ctx.stroke();

    // ctx.strokeStyle = ROAD_INNER_COLOR.toString();
    // ctx.lineWidth = ROAD_INNER_WIDTH;
    // ctx.stroke();

    ctx.setLineDash(ROAD_DIRECTION_DASH);
    ctx.strokeStyle = ROAD_DASH_COLOR.toString();
    ctx.lineDashOffset = -time * ROAD_DASH_SPEED;
    ctx.lineWidth = ROAD_DASH_WIDTH;
    // ctx.strokeStyle = 'black';
    // ctx.lineWidth = 1;
    ctx.stroke();
  }
}
