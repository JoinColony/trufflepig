/* @flow */

import type { $Application, $Request, $Response } from 'express';
import type { Accounts, Server, TPOptions } from './flowtypes';

const express = require('express');
const cors = require('cors');
const EventEmitter = require('events');

const ContractCache = require('./contract_cache');

const {
  CONTRACTS_ENDPOINT,
  ACCOUNTS_ENDPOINT,
  CORS_WHITELIST,
  DEFAULT_PIG_PORT,
  KEY_PLUGINS,
} = require('./constants');

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

class TrufflePig extends EventEmitter {
  _accounts: Accounts;
  _cache: ContractCache;
  _listener: ?Server;
  _options: TPOptions;
  _server: $Application;
  constructor({
    contractDir,
    port = DEFAULT_PIG_PORT,
    verbose = false,
    ganacheKeyFile = '',
    keystoreDir = '',
    keystorePassword = '',
  }: TPOptions) {
    super();
    this._options = {
      contractDir,
      port,
      verbose,
      ganacheKeyFile,
      keystoreDir,
      keystorePassword,
    };
    this._accounts = {};
  }
  apiUrl(): string {
    return `http://127.0.0.1:${this._options.port}${CONTRACTS_ENDPOINT}`;
  }
  createCache() {
    const { contractDir, verbose } = this._options;
    this._cache = new ContractCache(contractDir);

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
      this.emit('error', error);
    });
  }
  createAccountCache() {
    const { ganacheKeyFile, keystoreDir, keystorePassword } = this._options;
    if (ganacheKeyFile) {
      const ganacheCache = KEY_PLUGINS.ganache(
        ganacheKeyFile,
        {},
        this.setAccounts.bind(this),
      );
      ganacheCache.on('error', this.emit.bind(this, 'error'));
    }
    if (keystoreDir) {
      const keystoreCache = KEY_PLUGINS.keystore(
        keystoreDir,
        { password: keystorePassword },
        this.setAccounts.bind(this),
      );
      keystoreCache.on('error', this.emit.bind(this, 'error'));
    }
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
    this._server.get(ACCOUNTS_ENDPOINT, (req: $Request, res: $Response) => {
      res.json(this._accounts);
    });

    this._listener = this._server.listen(port, () => {
      this.emit('ready', this.apiUrl());
    });
  }
  start(): void {
    this.createCache();
    this.createAccountCache();
    this.createServer();
  }
  close(): void {
    if (this._listener) {
      this._listener.close();
    }
    this._cache.close();
  }
  getConfig(): TPOptions & { apiUrl: string } {
    return Object.assign({}, this._options, { apiUrl: this.apiUrl() });
  }
  setAccounts(accounts: Accounts): void {
    this._accounts = Object.assign({}, accounts);
  }
}

module.exports = TrufflePig;
