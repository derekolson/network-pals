// @flow
import invariant from 'invariant';
import StraightPathSegment from '../geom/path/StraightPathSegment';
import type Vector2 from '../geom/Vector2';
import SceneObject from '../render/SceneObject';
import { YELLOW } from '../colors';
import ConnectionSet from './ConnectionSet';
import type { ConnectionDirection } from './ConnectionSet';
import Traveller from './Traveller';
import type { NetworkNode, Connectable } from './interfaces';

// const ROAD_OUTER_COLOR = BLUE;
// const ROAD_INNER_COLOR = LIGHT_BG;
const ROAD_DASH_COLOR = YELLOW.lighten(0.1);
// const ROAD_OUTER_WIDTH = 12;
// const ROAD_INNER_WIDTH = 13;
const ROAD_DASH_WIDTH = 4;
const ROAD_DIRECTION_DASH = [5, 10];
const ROAD_DASH_SPEED = 0.05;

export default class Road extends SceneObject implements Connectable {
  _from: NetworkNode;
  _to: NetworkNode;
  _path: StraightPathSegment;
  _currentTravellers: Traveller[] = [];

  constructor(from: NetworkNode, to: NetworkNode) {
    super();
    this._from = from;
    this._to = to;

    const angleFrom = from.position.angleBetween(to.position);
    const angleTo = to.position.angleBetween(from.position);
    this._path = new StraightPathSegment(
      from.getVisualConnectionPointAtAngle(angleFrom),
      to.getVisualConnectionPointAtAngle(angleTo),
    );

    from.connectTo(this, ConnectionSet.OUT);
    to.connectTo(this, ConnectionSet.IN);
  }

  get length(): number {
    return this._path.length;
  }

  addTravellerAtStart(traveller: Traveller) {
    this._currentTravellers.push(traveller);
    traveller.onAddedToRoad(this);
  }

  // eslint-disable-next-line no-unused-vars
  connectTo(node: Connectable, direction: ConnectionDirection) {
    invariant('Cannot call connectTo on road hmm i should refactor this');
  }

  getAllDestinations(): NetworkNode[] {
    return [this._to];
  }

  getPointAtPosition(position: number): Vector2 {
    return this._path.getPointAtPosition(position);
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.moveTo(this._path.start.x, this._path.start.y);
    ctx.lineTo(this._path.end.x, this._path.end.y);

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
    ctx.stroke();
  }
}
