// @flow
import Vector2 from '../geom/Vector2';
import ConnectionSet from './ConnectionSet';
import type { ConnectionDirection } from './ConnectionSet';
import type { NetworkNode, Connectable } from './interfaces';

export default class Intersection implements NetworkNode {
  position: Vector2;
  _connectionSet: ConnectionSet = new ConnectionSet();

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
  }

  getVisualConnectionPointAtAngle(): Vector2 {
    return this.position;
  }

  connectTo(node: Connectable, direction: ConnectionDirection) {
    this._connectionSet.add(node, direction);
  }
}
