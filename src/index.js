/* @flow */

import express from 'express';
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

export default class TrufflePig {
  _options: Options;
  _listener: Server;
  _server: $Application;
  _cache: TrufflePigCache;
  constructor({ paths, port = DEFAULT_PORT, endpoint = DEFAULT_ENDPOINT, verbose = false }: Options) {
    if (!paths || paths.length === 0) {
      throw new Error('Please define a location for the contracts using the "path" option');
    }
    this._options = {
      paths,
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
    const { paths, verbose } = this._options;
    this._cache = new TrufflePigCache({ paths, verbose });

    this._cache.on('add', path => {
      if (verbose) console.log(`TrufflePig: Cache added: ${path}`);
    });

    this._cache.on('change', path => {
      if (verbose) console.log(`TrufflePig: Cache changed: ${path}`);
    });

    this._cache.on('remove', path => {
      if (verbose) console.log(`TrufflePig: Cache removed: ${path}`);
    });

    this._cache.on('error', error => {
      if (verbose) console.log(`TrufflePig: Error from cache: ${error.message || error.stack}`);
    });
  }
  createServer() {
    const { endpoint, port, verbose } = this._options;
    this._server = express();

    this._server.get(endpoint, ({ query }: $Request, res: $Response) => {
      if (Object.keys(query).length > 0) {
        const contract = this._cache.findContract(query);

        if (verbose && !contract) console.log(`TrufflePig: Unable to find contract matching query ${JSON.stringify(query)}`);

        return res.json(contract || {});
      }
      return res.json(this._cache.contractNames());
    });

    this._listener = this._server.listen(port, () => {
      if (verbose) console.log(`TrufflePig: Server listening on ${this.apiUrl()}`);
    });
  }
  start() {
    this.createCache();
    this.createServer();
  }
}
