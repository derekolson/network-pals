// @flow
import type Vector2 from '../geom/Vector2';
import type { ConnectionDirection } from './ConnectionSet';
import type Road from './Road';
import type Traveller from './Traveller';

export interface NetworkNode {
  +canConsumeTraveller: boolean;
  +incomingConnections: Road[];
  +isDestination: boolean;
  +outgoingConnections: Road[];
  +position: Vector2;
  connectTo(target: Road, direction: ConnectionDirection): void;
  consumeTraveller(traveller: Traveller): void;
  getAllReachableNodes(visitedNodes?: Set<NetworkNode>): NetworkNode[];
  getVisualConnectionPointAtAngle(radians: number): Vector2;
}
