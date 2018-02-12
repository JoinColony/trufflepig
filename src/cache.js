/* @flow */

import { readFile } from 'fs';
import { promisify } from 'util';
import chokidar from 'chokidar';
import EventEmitter from 'events';

type TruffleArtifact = {
  abi: Object,
  contractName: string,
  networks?: Object,
};

type Contracts = Map<string, TruffleArtifact>;

type Query = {
  isDeployed?: string | Array<string>,
  name?: string | Array<string>,
};

export default class TrufflePigCache extends EventEmitter {
  _contracts: Contracts;
  _watcher: any;

  static contractMatchesQuery(
    contract: TruffleArtifact,
    query: Query,
  ): boolean {
    // TODO later: if the need arises, support limiting by fields other than name
    return query.name === contract.contractName;
  }
  async readContractFile(path: string): Promise<TruffleArtifact | null> {
    let contents: string;
    try {
      contents = await promisify(readFile)(path);
    } catch (e) {
      this.emit('error', `Could not read file: ${path}`);
      return null;
    }
    try {
      return JSON.parse(contents);
    } catch (e) {
      this.emit('error', `Could not parse file: ${path}`);
      return null;
    }
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
  async add(path: string): Promise<void> {
    if (this._contracts.has(path)) return;
    const contract = await this.readContractFile(path);
    if (contract) {
      this._contracts.set(path, contract);
      this.emit('add', path);
    }
  }
  async change(path: string): Promise<void> {
    if (!this._contracts.has(path)) {
      this.emit('error', `Can not change non existing path ${path}`);
      return;
    }
    const contract = await this.readContractFile(path);
    if (contract) {
      this._contracts.set(path, contract);
      this.emit('change', path);
    }
  }
  close(): void {
    this._watcher.close();
  }
  remove(path: string): void {
    this._contracts.delete(path);
    this.emit('remove', path);
  }
  contractNames() {
    return {
      contractNames: [...this._contracts.values()].map(
        contract => contract.contractName,
      ),
    };
  }
  findContracts(query: Query) {
    return [...this._contracts.values()].filter(contract =>
      TrufflePigCache.contractMatchesQuery(contract, query),
    );
  }
  findContract(query: Query) {
    return [...this._contracts.values()].find(contract =>
      TrufflePigCache.contractMatchesQuery(contract, query),
    );
  }
}
