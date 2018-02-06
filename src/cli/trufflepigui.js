/* @flow */

import readline from 'readline';
import { spawn } from 'child_process';

import Ganache from './ganache';
import printMainMenu from './menu';
import TrufflePig from '../';

class TrufflePigUI {
  static unhookKeyboard() {
    process.stdin.pause();
    process.stdin.setRawMode(false);
  }
  static hookKeyboard() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
  }
  constructor(pigConfig, ganacheConfig = {}) {
    this._status = {
      message: '',
      apiUrl: '',
      ganacheListening: false,
    };
    this._config = {
      ganacheOpts: Object.assign({ port: 8545 }, ganacheConfig),
      trufflePigOpts: Object.assign({}, pigConfig),
    };
    this.setupServices();
  }
  setupServices() {
    this._ganache = new Ganache(this._config.ganacheOpts);
    this._pig = new TrufflePig(this._config.trufflePigOpts);
    this._ganache.on('error', err => this.update('message', new Error(`Ganache server error: ${err}`)));
    this._pig.on('error', err => this.update('message', new Error(`Pig server error: ${err}`)));
    this._pig.on('log', log => this.update('message', log));
    this._pig.on('ready', apiUrl => this.update('apiUrl', apiUrl));
  }
  async start() {
    this.update();
    const ganacheState = await this._ganache.start();
    if (!ganacheState) {
      return;
    }
    this.update('ganacheReady', true);
    this._pig.setGanacheState(ganacheState);
    this._pig.start();
    this.listenToKeyboardEvents();
  }
  async close() {
    this.update('message', "Shutting down gracefully... (Press CTRL+C if you're impatient)");
    if (this._ganache && this._ganache.listening) {
      this._ganache.close();
    }
    this._pig.close();
    this.constructor.unhookKeyboard();
  }
  spawn(bin, args, stdio) {
    this.constructor.unhookKeyboard();
    const cmd = `${bin} ${args.join(' ')}`;
    this.update('message', `Running ${cmd}...`);
    const proc = spawn(`node_modules/.bin/${bin}`, args, {
      stdio: stdio || 'inherit',
    });
    proc.on('error', err => {
      this.constructor.hookKeyboard();
      this.update('message', new Error(`Could not spawn ${cmd}: ${err.message}`));
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
  update(status, val) {
    this._status[status] = val;
    printMainMenu(this._status, this._config);
  }
  listenToKeyboardEvents() {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', async (str, key) => {
      if (!key) {
        return;
      }
      if ((key.ctrl && key.name === 'c') || key.name === 'q') {
        this.close();
      }
      if (key.name === 'g') {
        const state = await this._ganache.start();
        this._pig.setGanacheState(state);
        this.update('message', 'Ganache server restarted successfully');
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
    process.on('SIGINT', () => console.log('Life is a pigsty 🎵'));
  }
  async deployContracts() {
    this.spawn('truffle', ['migrate', '--reset', '--compile-all'], 'ignore');
  }
  spawnTruffleConsole() {
    this.spawn('truffle', ['console'], 'inherit');
  }
}
export default TrufflePigUI;
