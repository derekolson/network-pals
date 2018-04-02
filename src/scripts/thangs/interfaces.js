// @flow
import type Vector2 from '../geom/Vector2';
import type { ConnectionDirection } from './ConnectionSet';
import type Road from './Road';

export interface NetworkNode {
  +isDestination: boolean;
  +isNode: true;
  +position: Vector2;
  getVisualConnectionPointAtAngle(radians: number): Vector2;
  getAllDestinations(visitedNodes?: Set<NetworkNode>): NetworkNode[];
  connectTo(target: Road, direction: ConnectionDirection): void;
}
