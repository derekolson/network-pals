// @flow
import Circle from '../geom/Circle';
import type Vector2 from '../geom/Vector2';
import SceneObject from '../render/SceneObject';
import ShapeHelpers from '../render/ShapeHelpers';
import { RED } from '../colors';
import ConnectionSet from './ConnectionSet';
import type { ConnectionDirection } from './ConnectionSet';
import type { NetworkNode, Connectable } from './interfaces';

const DEFAULT_COOLDOWN = 1000;

const RADIUS = 20;
const VISUAL_CONNECTION_RADIUS = 30;

const MAIN_COLOR = RED;

export default class Consumer extends SceneObject implements NetworkNode {
  _circle: Circle;
  _visualConnectionCircle: Circle;
  _cooldown: number;
  _connectionSet: ConnectionSet = new ConnectionSet();

  constructor(x: number, y: number, cooldown: number = DEFAULT_COOLDOWN) {
    super();
    this._circle = new Circle(x, y, RADIUS);
    this._visualConnectionCircle = new Circle(x, y, VISUAL_CONNECTION_RADIUS);
    this._cooldown = cooldown;
  }

  get position(): Vector2 {
    return this._circle.center;
  }

  getVisualConnectionPointAtAngle(radians: number): Vector2 {
    return this._visualConnectionCircle.pointOnCircumference(radians);
  }

  connectTo(node: Connectable, direction: ConnectionDirection) {
    this._connectionSet.add(node, direction);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = MAIN_COLOR.toString();
    ShapeHelpers.circle(
      ctx,
      this._circle.center.x,
      this._circle.center.y,
      this._circle.radius,
    );
    ctx.fill();
  }
}
