/* @flow */

import express from 'express';
import TrufflePigCache from './cache';

type CacheOptions = {
  paths: Array<string>,
  verbose?: boolean,
};

type ServerOptions = {
  port?: number,
  verbose?: boolean,
};

export type Options = CacheOptions & ServerOptions;

const API = '/contracts';
const DEFAULT_PORT = 3030;

export default class TrufflePig {
  constructor({ paths = [], port = DEFAULT_PORT, verbose = false }: Options) {
    this.createCache({ paths, verbose });
    this.createServer({ port, verbose });
  }
  apiUrl() {
    return `${this._listener.address()}${API}`;
  }
  createCache({ paths, verbose }: CacheOptions) {
    this._cache = new TrufflePigCache({ paths, verbose });
    this._cache.initialize();

    this._cache.on('add', path => {
      // eslint-disable-next-line no-console
      if (verbose) console.log(`TrufflePig: Cache added: ${path}`);
    });

    this._cache.on('change', path => {
      // eslint-disable-next-line no-console
      if (verbose) console.log(`TrufflePig: Cache changed: ${path}`);
    });

    this._cache.on('remove', path => {
      // eslint-disable-next-line no-console
      if (verbose) console.log(`TrufflePig: Cache removed: ${path}`);
    });

    this._cache.on('error', error => {
      // eslint-disable-next-line no-console
      if (verbose) console.log(`TrufflePig: Error from cache: ${error.message || error.stack}`);
    });
  }
  createServer({ port = DEFAULT_PORT, verbose }: ServerOptions) {
    this._server = express();

    this._server.get(API, ({ query }, res) => {
      if (Object.keys(query).length > 0) {
        const contract = this._cache.findContract(query);

        // eslint-disable-next-line no-console
        if (verbose && !contract) console.log(`TrufflePig: Unable to find contract matching query ${JSON.stringify(query)}`);

        return res.json(contract || {});
      }
      return res.json(this._cache.contractNames());
    });

    this._listener = this._server.listen(port, () => {
      // eslint-disable-next-line no-console
      if (verbose) console.log(`TrufflePig: Server listening on ${port.toString()}`);
    });
  }
}
