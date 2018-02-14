/* @flow */

import readline from 'readline';
import { spawn } from 'child_process';

import type { GanacheOptions, TPOptions } from '../flowtypes';

import Ganache from './ganache';
import printMainMenu from './menu';
import TrufflePig from '../';

export type Status = {
  message: string,
  apiUrl: string,
  ganacheListening: boolean,
  winkingL: boolean,
  winkingR: boolean,
};

export type Config = {
  ganacheOpts: GanacheOptions,
  trufflePigOpts: TPOptions,
};

class TrufflePigUI {
  _status: Status;
  _config: Config;
  _ganache: Ganache;
  _pig: TrufflePig;
  static setRawMode(enabled: boolean) {
    if (process.stdin.isTTY) {
      (process.stdin: any).setRawMode(enabled);
    }
  }
  static unhookKeyboard(): void {
    process.stdin.pause();
    TrufflePigUI.setRawMode(false);
  }
  static hookKeyboard(): void {
    TrufflePigUI.setRawMode(true);
    process.stdin.resume();
  }
  constructor(pigConfig: TPOptions, ganacheConfig: GanacheOptions = {}) {
    this._status = {
      message: '',
      apiUrl: '',
      ganacheListening: false,
      winkingL: false,
      winkingR: false,
    };
    this._config = {
      ganacheOpts: Object.assign({ port: 8545 }, ganacheConfig),
      trufflePigOpts: pigConfig,
    };
    this.setupServices();
    this.setupWinks();
  }
  get didStartWithGanache(): boolean {
    return this._config.ganacheOpts.startGanache;
  }
  get ganacheDidStart(): boolean {
    return this._ganache && this._ganache.listening;
  }
  setupWinks(): void {
    let changed = false;
    setInterval(() => {
      if (changed) {
        this.update();
        changed = false;
      }
      if (this._status.winkingL || this._status.winkingR) {
        this._status.winkingL = false;
        this._status.winkingR = false;
        changed = true;
      } else {
        this._status.winkingL = Math.random() > 0.8;
        this._status.winkingR = this._status.winkingL || Math.random() > 0.9;
        changed = this._status.winkingL || this._status.winkingR;
      }
    }, 1000);
  }
  setupGanache(): void {
    this._ganache = new Ganache(this._config.ganacheOpts);
    this._ganache.on('error', err =>
      this.update('message', new Error(`Ganache server error: ${err}`)),
    );
  }
  setupPig(): void {
    this._pig = new TrufflePig(this._config.trufflePigOpts);
    this._pig.on('error', err =>
      this.update('message', new Error(`Pig server error: ${err}`)),
    );
    this._pig.on('log', log => this.update('message', log));
    this._pig.on('ready', apiUrl => this.update('apiUrl', apiUrl));
  }
  setupServices() {
    if (this.didStartWithGanache) this.setupGanache();
    this.setupPig();
  }
  async startGanache() {
    if (!this._ganache) await this.setupGanache();
    const ganacheState = await this._ganache.start();
    if (!ganacheState) return;
    this.update('ganacheReady', true);
    this._pig.setGanacheState(ganacheState);
    this.update('message', 'Ganache server restarted successfully');
  }
  async stopGanache() {
    await this._ganache.close();
    this.update('ganacheReady', false);
    this.update('message', 'Ganache server stopped successfully');
  }
  async start() {
    this.update();
    if (this.didStartWithGanache) await this.startGanache();
    this._pig.start();
    this.listenToKeyboardEvents();
  }
  async close() {
    this.update(
      'message',
      "Shutting down gracefully... (Press CTRL+C if you're impatient)",
    );
    if (this.ganacheDidStart) await this.stopGanache();
    this._pig.close();
    this.constructor.unhookKeyboard();
    process.exit(0);
  }
  spawn(bin: string, args: Array<string>, stdio: Array<string> | string) {
    this.constructor.unhookKeyboard();
    const cmd = `${bin} ${args.join(' ')}`;
    this.update('message', `Running ${cmd}...`);
    const proc = spawn(`node_modules/.bin/${bin}`, args, {
      stdio: stdio || 'inherit',
    });
    proc.on('error', err => {
      this.constructor.hookKeyboard();
      this.update(
        'message',
        new Error(`Could not spawn ${cmd}: ${err.message}`),
      );
    });
    proc.on('exit', code => {
      this.constructor.hookKeyboard();
      const msg = `${cmd} exited with code ${code}`;
      if (code > 0) {
        return this.update('message', new Error(msg));
      }
      return this.update('message', msg);
    });
  }
  update(status?: string, val?: any) {
    if (status) {
      this._status[status] = val;
    }
    if (!process.stdin.isRaw) {
      // Do not update the UI if keyboard is unhooked
      return;
    }
    printMainMenu(this._status, this._config);
  }
  async listenToKeyboardEvents() {
    readline.emitKeypressEvents(process.stdin);
    TrufflePigUI.setRawMode(true);
    process.stdin.on('keypress', async (str, key) => {
      if (!key) {
        return;
      }
      if ((key.ctrl && key.name === 'c') || key.name === 'q') {
        this.close();
      }
      if (key.name === 'g') {
        if (!this._ganache) this.setupGanache();
        if (this.ganacheDidStart) {
          console.log('stopping');
          await this.stopGanache();
        } else {
          console.log('starting');
          await this.startGanache();
        }
      }
      if (key.name === 'd') {
        this.deployContracts();
      }
      if (key.name === 't') {
        this.spawnTruffleConsole();
      }
      if (key.name === 'return') {
        this.update();
      }
    });
    process.on('SIGINT', () => {
      console.log('Life is a pigsty 🎵');
      process.exit(0);
    });
  }
  async deployContracts() {
    this.spawn('truffle', ['migrate', '--reset', '--compile-all'], 'ignore');
  }
  spawnTruffleConsole() {
    this.spawn('truffle', ['console'], 'inherit');
  }
}
export default TrufflePigUI;
