// @flow
import { sample } from '../util';
import type Road from './Road';

export type ConnectionDirection = 'IN' | 'OUT';

export default class ConnectionSet {
  static IN: ConnectionDirection = 'IN';
  static OUT: ConnectionDirection = 'OUT';

  incoming: Road[] = [];
  outgoing: Road[] = [];

  add(target: Road, direction: ConnectionDirection) {
    switch (direction) {
      case ConnectionSet.IN:
        this.addIncoming(target);
        break;
      case ConnectionSet.OUT:
        this.addOutgoing(target);
        break;
      default:
        throw new Error(`unknow connection direction ${direction}`);
    }
  }

  addIncoming(target: Road) {
    this.incoming.push(target);
  }

  addOutgoing(target: Road) {
    this.outgoing.push(target);
  }

  sampleIncoming(): Road {
    return sample(this.incoming);
  }

  sampleOutgoing(): Road {
    return sample(this.outgoing);
  }
}
