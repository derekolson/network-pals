// @flow
import Vector2 from '../geom/Vector2';
import ConnectionSet from './ConnectionSet';
import type { ConnectionDirection } from './ConnectionSet';
import type { NetworkNode } from './interfaces';
import type Road from './Road';
import { uniq } from '../util';

export default class Intersection implements NetworkNode {
  isDestination = false;
  isNode = true;
  position: Vector2;
  _connectionSet: ConnectionSet = new ConnectionSet();

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
  }

  getAllDestinations(
    visitedNodes: Set<NetworkNode> = new Set(),
  ): NetworkNode[] {
    visitedNodes.add(this);
    const destinations = [];
    this._connectionSet.outgoing.map(node => node.to).forEach(node => {
      if (!visitedNodes.has(node)) {
        node
          .getAllDestinations(visitedNodes)
          .forEach(node => destinations.push(node));
      }
    });
    return uniq(destinations);
  }

  getVisualConnectionPointAtAngle(): Vector2 {
    return this.position;
  }

  connectTo(node: Road, direction: ConnectionDirection) {
    this._connectionSet.add(node, direction);
  }
}
