// @flow
import invariant from 'invariant';
import Vector2 from '../../lib/geom/Vector2';
import { uniq, flatten } from '../../lib/util';
import ConnectionSet from '../lib/ConnectionSet';
import type { ConnectionDirection } from '../lib/ConnectionDirections';
import PathFinder from '../lib/PathFinder';
import type Road from '../Road';
import type Traveller from '../Traveller';
import type { NetworkNode } from './NetworkNode';

export default class Intersection implements NetworkNode {
  isDestination = false;
  position: Vector2;
  _connectionSet: ConnectionSet = new ConnectionSet();

  constructor(x: number, y: number) {
    this.position = new Vector2(x, y);
  }

  get incomingConnections(): Road[] {
    return this._connectionSet.incoming;
  }

  get outgoingConnections(): Road[] {
    return this._connectionSet.outgoing;
  }

  get canConsumeTraveller(): boolean {
    return true;
  }

  consumeTraveller(traveller: Traveller) {
    const destination = traveller.destination;
    invariant(destination, 'traveller must have destination');

    const nextRoad = PathFinder.getNextRoad(this, destination);
    invariant(
      this.outgoingConnections.includes(nextRoad),
      'nextRoad must be from this intersection',
    );

    traveller.removeFromCurrentRoad();
    nextRoad.addTravellerAtStart(traveller);
  }

  getAllReachableNodes(visited: Set<NetworkNode> = new Set()): NetworkNode[] {
    visited.add(this);
    return uniq(
      flatten(
        this._connectionSet.outgoing.map(road =>
          road.getAllReachableNodes(visited),
        ),
      ),
    );
  }

  getVisualConnectionPointAtAngle(): Vector2 {
    return this.position;
  }

  getClosestOutgoingTraveller(): Traveller | null {
    let bestTraveller = null;
    let shortestDistance = Infinity;
    this.outgoingConnections.forEach(road => {
      const traveller = road.getTravellerAfterPosition(-1);
      if (traveller && traveller.positionOnCurrentRoad < shortestDistance) {
        bestTraveller = traveller;
        shortestDistance = traveller.positionOnCurrentRoad;
      }
    });

    return bestTraveller;
  }

  getClosestIncomingTraveller(): Traveller | null {
    let bestTraveller = null;
    let shortestDistance = Infinity;
    this.incomingConnections.forEach(road => {
      const traveller = road.getTravellerBeforePosition(road.length);
      if (
        traveller &&
        traveller.distanceToEndOfCurrentRoad < shortestDistance
      ) {
        bestTraveller = traveller;
        shortestDistance = traveller.distanceToEndOfCurrentRoad;
      }
    });

    return bestTraveller;
  }

  connectTo(node: Road, direction: ConnectionDirection) {
    this._connectionSet.add(node, direction);
  }
}
