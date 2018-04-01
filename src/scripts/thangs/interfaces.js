// @flow
import type Vector2 from '../geom/Vector2';
import type { ConnectionDirection } from './ConnectionSet';

export interface Connectable {
  connectTo(target: Connectable, direction: ConnectionDirection): void;
}

export interface NetworkNode extends Connectable {
  +position: Vector2;
  getVisualConnectionPointAtAngle(radians: number): Vector2;
}
