/* @flow */

import express from 'express';
import EventEmitter from 'events';
import type { $Application, $Request, $Response } from 'express';
import TrufflePigCache from './cache';

type CacheOptions = {
  paths: Array<string>,
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
};

export type Options = CacheOptions & ServerOptions;

const DEFAULT_ENDPOINT = 'contracts';
const DEFAULT_PORT = 3030;

export default class TrufflePig extends EventEmitter {
  _options: Options;
  _listener: Server;
  _server: $Application;
  _cache: TrufflePigCache;
  constructor({ contractDir, port = DEFAULT_PORT, endpoint = DEFAULT_ENDPOINT, verbose = false }: Options) {
    super();
    this._options = {
      contractDir,
      port,
      endpoint,
      verbose,
    };
  }
  apiUrl(): string {
    const { port } = this._listener.address();
    return `http://127.0.0.1:${port}/${this._options.endpoint}`;
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
  createServer(ganacheConfig) {
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
      res.json(ganacheConfig);
    });

    this._listener = this._server.listen(port, () => {
      this.emit('ready', port);
    });
  }
  start(ganacheConfig): void {
    this.createCache();
    this.createServer(ganacheConfig);
  }
  close(): void {
    this._listener.close();
    this._cache.close();
  }
}
