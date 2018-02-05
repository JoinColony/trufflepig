/* @flow */

import readline from 'readline';
import { spawn } from 'child_process';
import ganache from 'ganache-cli';
import { promisify as pfy } from 'util';

import printMainMenu from './menu';

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
  }
  start() {
    this._ganacheServer = ganache.server();
    this._ganacheServer.on('error', err => this.update('message', err));
    this._pig.on('error', err => this.update('message', err));
    this._pig.on('log', log => this.update('message', log));
    this.update();
    this._pig.start();
    this.startGanache();
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
        this.startGanache();
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
  async startGanache() {
    if (this._status.ganacheListening) {
      await pfy(this._ganacheServer.close)();
    }
    try {
      await pfy(this._ganacheServer.listen)(this._config.ganachePort);
    } catch (e) {
      this.update('message', e);
      return false;
    }
    this.update('message', null);
    this.update('ganacheListening', true);
    this.update('message', 'Ganache server (re-)started successully');
    return true;
  }
  spawnTruffleConsole() {
    this.spawn('truffle', ['console'], 'inherit');
  }
  async close() {
    if (this._ganacheServer.listening) {
      await pfy(this._ganacheServer.close)();
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
