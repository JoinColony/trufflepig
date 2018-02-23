/* @flow */

import type { TPOptions } from '../flowtypes';

export type Status = {
  message: string,
};

export type Config = {
  trufflePigOpts: TPOptions,
};

const { spawn } = require('child_process');

const TrufflePig = require('../');
const TrufflePigUI = require('./ui');

class TrufflePigCLI {
  _status: Status;
  _config: Config;
  _pig: TrufflePig;
  constructor(pigConfig: TPOptions) {
    this._status = {
      message: '',
    };
    this._config = {
      trufflePigOpts: pigConfig,
    };
    this._ui = new TrufflePigUI();
    this._ui.onSelect(idx => {
      switch (idx) {
        case 0:
          this.spawnTruffleConsole();
          break;
        case 1:
          this.deployContracts();
          break;
        case 2:
          this.close();
          break;
        default:
          break;
      }
    });
    this.setupPig();
  }
  setupPig(): void {
    this._pig = new TrufflePig(this._config.trufflePigOpts);
    this._pig.on('error', err =>
      this._ui.log(new Error(`Pig server error: ${err}`).message, 'error'),
    );
    this._pig.on('log', log => this._ui.log(log));
    this._pig.on('ready', apiUrl =>
      this._ui.log(`Serving contracts under ${apiUrl}`),
    );
  }
  async start() {
    this._pig.start();
    this._ui.start();
  }
  async close() {
    this._ui.log(
      "Shutting down gracefully... (Press CTRL+C if you're impatient)",
    );
    this._pig.close();
    this._ui.stop();
    process.exit(0);
  }
  spawn(bin: string, args: Array<string>, stdio: Array<string> | string) {
    const cmd = `${bin} ${args.join(' ')}`;
    this._ui.log(`Running ${cmd}...`);
    const proc = spawn(`node_modules/.bin/${bin}`, args, {
      stdio: stdio || 'inherit',
    });
    proc.on('error', err => {
      this._ui.log(
        new Error(`Could not spawn ${cmd}: ${err.message}`),
        'error',
      );
    });
    proc.on('exit', code => {
      const msg = `${cmd} exited with code ${code}`;
      if (code > 0) {
        return this._ui.log(new Error(msg), 'error');
      }
      return this._ui.log(msg);
    });
  }
  async deployContracts() {
    this.spawn('truffle', ['migrate', '--reset', '--compile-all'], 'ignore');
  }
  spawnTruffleConsole() {
    this.spawn('truffle', ['console'], 'inherit');
  }
}
module.exports = TrufflePigCLI;
