// @flow
import { sample } from '../util';
import type { Connectable } from './interfaces';

export type ConnectionDirection = 'IN' | 'OUT';

export default class ConnectionSet {
  static IN: ConnectionDirection = 'IN';
  static OUT: ConnectionDirection = 'OUT';

  _incoming: Connectable[] = [];
  _outgoing: Connectable[] = [];

  add(target: Connectable, direction: ConnectionDirection) {
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

  addIncoming(target: Connectable) {
    this._incoming.push(target);
  }

  addOutgoing(target: Connectable) {
    this._outgoing.push(target);
  }

  sampleIncoming(): Connectable {
    return sample(this._incoming);
  }

  sampleOutgoing(): Connectable {
    return sample(this._outgoing);
  }
}
