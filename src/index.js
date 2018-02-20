/* @flow */

import express from 'express';
import cors from 'cors';
import EventEmitter from 'events';
import type { $Application, $Request, $Response } from 'express';
import type { Server, TPOptions } from './flowtypes';
import TrufflePigCache from './cache';

import {
  CONTRACTS_ENDPOINT,
  CONFIG_ENDPOINT,
  CORS_WHITELIST,
  DEFAULT_PIG_PORT,
} from './constants';

const CORS_OPTIONS = {
  origin(origin = '', callback) {
    // eslint-disable-next-line no-unused-vars
    const [_, domain] = origin.match(/.+:\/\/?([^/:]+)/) || [];
    if (origin.length === 0 || CORS_WHITELIST.includes(domain)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

export default class TrufflePig extends EventEmitter {
  _options: TPOptions;
  _listener: Server;
  _server: $Application;
  _cache: TrufflePigCache;
  constructor({
    contractDir,
    port = DEFAULT_PIG_PORT,
    verbose = false,
  }: TPOptions) {
    super();
    this._options = {
      contractDir,
      port,
      verbose,
    };
  }
  apiUrl(): string {
    return `http://127.0.0.1:${this._options.port}${CONTRACTS_ENDPOINT}`;
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
    const { port, verbose } = this._options;
    this._server = express();
    this._server.all('*', cors(CORS_OPTIONS));
    this._server.get(
      CONTRACTS_ENDPOINT,
      ({ query }: $Request, res: $Response) => {
        if (Object.keys(query).length > 0) {
          const contract = this._cache.findContract(query);
          if (verbose && !contract)
            this.emit(
              'error',
              new Error(
                `Unable to find contract matching query ${JSON.stringify(
                  query,
                )}`,
              ),
            );
          return res.json(contract || {});
        }
        return res.json(this._cache.contractNames());
      },
    );
    this._server.get(CONFIG_ENDPOINT, (req: $Request, res: $Response) => {
      // TODO: For now just return an empty object
      res.json({});
    });

    this._listener = this._server.listen(port, () => {
      this.emit('ready', this.apiUrl());
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
  getConfig(): TPOptions & { apiUrl: string } {
    return Object.assign({}, this._options, { apiUrl: this.apiUrl() });
  }
}
