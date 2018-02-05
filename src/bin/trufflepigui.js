/* @flow */

import readline from 'readline';
import { spawn } from 'child_process';

import printMainMenu from './menu';
import Ganache from '../ganache';

class TrufflePigUI {
  static unhookKeyboard() {
    process.stdin.pause();
    process.stdin.setRawMode(false);
  }
  static hookKeyboard() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
  }
  constructor(pig, config) {
    this._config = Object.assign({}, config, {
      ganachePort: 8545,
      contractDir: './build/contracts',
      pigAddress: 'http://localhost:3030/contracts',
    });
    this._status = {
      message: '',
      ganacheListening: false,
    };
    this._pig = pig;
    this._ganache = new Ganache({
      port: this._config.ganachePort,
    });
    this._ganache.on('error', err => this.update('message', new Error(`Ganache server error: ${err}`)));
    this._pig.on('error', err => this.update('message', new Error(`Pig server error: ${err}`)));
    this._pig.on('log', log => this.update('message', log));
    this._pig.on('ready', () => this.update('pigReady', true));
  }
  async start() {
    this.update();
    const ganacheState = await this._ganache.start();
    if (!ganacheState) {
      return;
    }
    this.update('ganacheReady', true);
    this._pig.start(ganacheState);
    this.listenToKeyboardEvents();
  }
  listenToKeyboardEvents() {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
      if (!key) {
        return;
      }
      if ((key.ctrl && key.name === 'c') || key.name === 'q') {
        this.close();
      }
      if (key.name === 'g') {
        this._ganache.start();
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
  }
  async deployContracts() {
    this.spawn('truffle', ['migrate', '--reset', '--compile-all'], 'ignore');
  }
  spawnTruffleConsole() {
    this.spawn('truffle', ['console'], 'inherit');
  }
  async close() {
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
}

export default TrufflePigUI;
