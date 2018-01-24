/* @flow */

import express from 'express';
import type { $Application, $Request, $Response } from 'express';
import TrufflePigCache from './cache';

type CacheOptions = {
  paths: Array<string>,
  verbose?: boolean,
};

type ServerOptions = {
  port?: number,
  verbose?: boolean,
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

const API = '/contracts';
const DEFAULT_PORT = 3030;

export default class TrufflePig {
  _listener: Server;
  _server: $Application;
  _cache: TrufflePigCache;
  constructor({ paths = [], port = DEFAULT_PORT, verbose = false }: Options) {
    this.createCache({ paths, verbose });
    this.createServer({ port, verbose });
  }
  apiUrl(): string {
    const { address, port } = this._listener.address();
    return `//${address}:${port}/${API}`;
  }
  createCache({ paths, verbose }: CacheOptions) {
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
  createServer({ port = DEFAULT_PORT, verbose }: ServerOptions) {
    this._server = express();

    this._server.get(API, ({ query }: $Request, res: $Response) => {
      if (Object.keys(query).length > 0) {
        const contract = this._cache.findContract(query);

        if (verbose && !contract) console.log(`TrufflePig: Unable to find contract matching query ${JSON.stringify(query)}`);

        return res.json(contract || {});
      }
      return res.json(this._cache.contractNames());
    });

    this._listener = this._server.listen(port, () => {
      if (verbose) console.log(`TrufflePig: Server listening on ${port.toString()}`);
    });
  }
}
