/* @flow */

import ganache from 'ganache-cli';
import EventEmitter from 'events';
import { promisify as pfy } from 'util';
import type { GanacheOptions, GanacheState, Server } from '../flowtypes';

class GanacheWrapper extends EventEmitter {
  _config: GanacheOptions;
  _port: number;
  _ganache: Server;
  constructor(options: GanacheOptions) {
    super();
    this._config = options;
    this._port = options.port || 8545;
    this._ganache = ganache.server(this._config);
    this._ganache.on('error', err => this.emit('error', err.message));
  }
  get listening(): boolean {
    return !!this._ganache.listening;
  }
  get state(): GanacheState {
    const { accounts } = this._ganache.provider.manager.state;
    const mappedAccounts = Object.keys(accounts).map(account => ({
      address: account,
      key: accounts[account].secretKey.toString('hex'),
    }));
    return {
      accounts: mappedAccounts,
    };
  }
  async start(): Promise<GanacheState> {
    if (this.listening) {
      this._ganache.close();
    }
    try {
      this._ganache = ganache.server(this._config);
      await pfy(this._ganache.listen)(this._port);
    } catch (e) {
      return this.emit('error', e.message);
    }
    return this.state;
  }
  close(): void {
    this._ganache.close();
  }
}

export default GanacheWrapper;
