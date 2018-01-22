/* @flow */

import fs from 'fs';
import chokidar from 'chokidar';
import EventEmitter from 'events';
import TrufflePigContract from './contract';

type Contracts = Map<string, TrufflePigContract>;

export default class TrufflePigCache extends EventEmitter {
  _contracts: Contracts;
  _watcher: any;

  static contractMatchesQuery(contract: TrufflePigContract, query: {}): boolean {
    return Object.keys(query).every(key => {
      let value = query[key];
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      return contract[key] === value;
    });
  }
  static async parseContract(path: string): TrufflePigContract {
    const artifact = JSON.parse(
      await new Promise((resolve, reject) => {
        fs.readFile(path, (error, body) => (error ? reject(error) : resolve(body)));
      })
    );
    return new TrufflePigContract(path, artifact);
  }
  constructor({ paths }: { paths: Array<string> }) {
    super();
    this._contracts = new Map();
    this._watcher = chokidar.watch(paths, {
      persistent: true,
    });
    this._watcher
      .on('add', async path => this.add(path))
      .on('change', async path => this.change(path))
      .on('error', error => this.emit('error', error))
      .on('unlink', path => this.remove(path));
  }
  async add(path: string) {
    if (this._contracts.has(path)) return;
    this._contracts.set(path, await this.constructor.parseContract(path));
    this.emit('add', path);
  }
  async change(path: string) {
    this._contracts.set(path, await this.constructor.parseContract(path));
    this.emit('change', path);
  }
  remove(path: string) {
    this._contracts.delete(path);
    this.emit('remove', path);
  }
  contractNames() {
    return {
      contractNames: [...this._contracts.values()].map(contract => contract.name),
    };
  }
  findContracts(query: {}) {
    return [...this._contracts.values()].find(contract => this.constructor.contractMatchesQuery(contract, query)).map(contract => contract.artifact);
  }
  findContract(query: {}) {
    return [...this._contracts.values()].find(contract => this.constructor.contractMatchesQuery(contract, query))[0];
  }
}
