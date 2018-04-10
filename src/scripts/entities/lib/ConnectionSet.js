// @flow
import { sample } from '../../lib/util';
import type Road from '../Road';
import ConnectionDirections from './ConnectionDirections';
import type { ConnectionDirection } from './ConnectionDirections';

export default class ConnectionSet {
  incoming: Road[] = [];
  outgoing: Road[] = [];

  add(target: Road, direction: ConnectionDirection) {
    switch (direction) {
      case ConnectionDirections.IN:
        this.addIncoming(target);
        break;
      case ConnectionDirections.OUT:
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
