/* @flow */

import ganache from 'ganache-cli';
import EventEmitter from 'events';
import { promisify as pfy } from 'util';

class GanacheWrapper extends EventEmitter {
  constructor(options) {
    super();
    this._port = options.port || 8545;
    this._ganache = ganache.server(options);
    this._ganache.on('error', err => this.emit('error', err.message));
  }
  get listening() {
    return !!this._ganache.listening;
  }
  get state() {
    const { accounts } = this._ganache.provider.manager.state;
    return Object.keys(accounts).map(account => ({
      address: account,
      key: accounts[account].secretKey.toString('hex'),
    }));
  }
  async start() {
    if (this.listening) {
      this._ganache.close();
    }
    try {
      await pfy(this._ganache.listen)(this._port);
    } catch (e) {
      return this.emit('error', e.message);
    }
    return this.state;
  }
  close() {
    this._ganache.close();
  }
}

export default GanacheWrapper;
