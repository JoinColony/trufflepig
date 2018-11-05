/* @flow */

import type { TPOptions } from '../flowtypes';

export type Config = {
  trufflePigOpts: TPOptions,
};

const TrufflePig = require('../');
const TrufflePigUI = require('./ui');

class TrufflePigCLI {
  _config: Config;

  _pig: TrufflePig;

  _ui: TrufflePigUI;

  constructor(pigConfig: TPOptions) {
    this._config = {
      trufflePigOpts: pigConfig,
    };
    this._ui = new TrufflePigUI();
    this._ui.onSelect(idx => {
      switch (idx) {
        case 0:
          this.deployContracts();
          break;
        case 1:
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

  async deployContracts() {
    this._ui.spawn('./node_modules/.bin/truffle', [
      'migrate',
      '--reset',
      '--compile-all',
    ]);
  }
}
module.exports = TrufflePigCLI;
