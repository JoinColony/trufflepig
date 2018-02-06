/* @flow */

import express from 'express';
import EventEmitter from 'events';
import type { $Application, $Request, $Response } from 'express';
import TrufflePigCache from './cache';

type CacheOptions = {
  contractDir: string,
  verbose: boolean,
};

type ServerOptions = {
  endpoint: string,
  port: number,
  verbose: boolean,
};

// Because of https://github.com/facebook/flow/issues/5113
type Server = {
  address: () => {
    address: string,
    family: string,
    port: number,
  },
  listen: () => Server,
  close: () => void,
};

type GanacheState = {
  accounts?: Array<{ address: string, key: string }>,
};

export type Options = CacheOptions & ServerOptions;

const DEFAULT_ENDPOINT = 'contracts';
const DEFAULT_PORT = 3030;

export default class TrufflePig extends EventEmitter {
  _options: Options;
  _listener: Server;
  _server: $Application;
  _cache: TrufflePigCache;
  _ganacheState: GanacheState;
  constructor({ contractDir, port = DEFAULT_PORT, endpoint = DEFAULT_ENDPOINT, verbose = false }: Options) {
    super();
    this._options = {
      contractDir,
      port,
      endpoint,
      verbose,
    };
    this._ganacheState = {};
  }
  apiUrl(): string {
    return `http://127.0.0.1:${this._options.port}/${this._options.endpoint}`;
  }
  createCache() {
    const { contractDir, verbose } = this._options;
    this._cache = new TrufflePigCache({ paths: [contractDir], verbose });

    this._cache.on('add', path => {
      if (verbose) this.emit('log', `Cache added: ${path}`);
    });

    this._cache.on('change', path => {
      if (verbose) this.emit('log', `Cache changed: ${path}`);
    });

    this._cache.on('remove', path => {
      if (verbose) this.emit('log', `Cache removed: ${path}`);
    });

    this._cache.on('error', error => {
      if (verbose) this.emit('error', error);
    });
  }
  createServer() {
    const { endpoint, port, verbose } = this._options;
    this._server = express();
    this._server.get(`/${endpoint}`, ({ query }: $Request, res: $Response) => {
      if (Object.keys(query).length > 0) {
        const contract = this._cache.findContract(query);
        if (verbose && !contract) this.emit('error', new Error(`Unable to find contract matching query ${JSON.stringify(query)}`));
        return res.json(contract || {});
      }
      return res.json(this._cache.contractNames());
    });
    this._server.get('/_config', (req: $Request, res: $Response) => {
      res.json(this._ganacheState);
    });

    this._listener = this._server.listen(port, () => {
      this.emit('ready', port);
    });
  }
  start(): void {
    this.createCache();
    this.createServer();
  }
  close(): void {
    this._listener.close();
    this._cache.close();
  }
  setGanacheState(state: GanacheState): void {
    this._ganacheState = state;
  }
  getConfig(): Options & { apiUrl: string } {
    return Object.assign({}, this._options, { apiUrl: this.apiUrl() });
  }
}
