/* @flow */

type State = {
  winkingL: boolean,
  winkingR: boolean,
};

type BlessedNode = Object;

const blessed = require('blessed');
const chalk = require('chalk');
const { spawn } = require('child_process');

const { red } = chalk;

class TrufflePigUI {
  _screen: BlessedNode;

  _logo: BlessedNode;

  _log: BlessedNode;

  _input: BlessedNode;

  _state: State;

  // eslint-disable-next-line no-undef
  _winkTimeout: TimeoutID;

  static createScreen() {
    return blessed.screen({
      smartCSR: true,
      title: 'trufflepig',
    });
  }

  static createLogo() {
    return blessed.box({
      top: 'center',
      left: 3,
      width: 27,
      height: 9,
      padding: 0,
      tags: true,
    });
  }

  static createBox() {
    return blessed.box({
      width: '100%',
      height: '50%',
      border: {
        type: 'line',
      },
      label: 'TrufflePig - Serving finest truffles since 2017',
    });
  }

  static createLog() {
    return blessed.log({
      top: '50%',
      height: '50%',
      fg: 'green',
      selectedFg: 'green',
      label: 'Pig Log',
      border: {
        type: 'line',
      },
    });
  }

  static createInput() {
    return blessed.list({
      top: 'center',
      left: 23,
      width: '100%-29',
      height: 8,
      label: 'What do you want your pig to do?',
      items: ['Redeploy contracts', 'Exit'],
      keys: true,
      border: {
        type: 'line',
      },
      style: {
        selected: {
          bg: '#f28fb1',
          fg: 'black',
        },
      },
    });
  }

  constructor() {
    this._state = {
      winkingL: false,
      winkingR: false,
    };
    this._screen = this.constructor.createScreen();
    const box = this.constructor.createBox();
    this._logo = this.constructor.createLogo();
    this._log = this.constructor.createLog();
    this._input = this.constructor.createInput();

    box.append(this._logo);
    box.append(this._input);

    this._screen.append(box);
    this._screen.append(this._log);
  }

  _setWink() {
    let timeout;
    if (this._state.winkingL || this._state.winkingR) {
      this._state.winkingL = false;
      this._state.winkingR = false;
      timeout = 2000;
    } else {
      this._state.winkingL = Math.random() > 0.8;
      this._state.winkingR = this._state.winkingL || Math.random() > 0.85;
      if (this._state.winkingL || this._state.winkingR) {
        timeout = 200;
      } else {
        timeout = 2000;
      }
    }
    this._logo.setContent(this._getLogoContent());
    this._screen.render();
    this._winkTimeout = setTimeout(this._setWink.bind(this), timeout);
  }

  _getLogoContent() {
    const eyes = () =>
      `${this._state.winkingL ? '-' : 'O'}${this._state.winkingR ? '-' : 'O'}`;

    const pigLogo = `┈┈{#f28fb1-fg}┏━╮╭━┓{/}┈┈┈┈┈┈┈
┈┈{#f28fb1-fg}┃┏┗┛┓┃{/}┈┈┈┈┈┈┈
┈┈{#f28fb1-fg}╰┓{/}{#ffffff-fg}${eyes()}{/}{#f28fb1-fg}┏╯{/}┈┈┈┈┈┈┈
┈{#f28fb1-fg}╭━┻╮╲┗━━━━╮╭╮{/}┈
┈{#f28fb1-fg}┃▎▎┃╲╲╲╲╲╲┣━╯{/}┈
┈{#f28fb1-fg}╰━┳┻▅╯╲╲╲╲┃{/}┈┈┈
┈┈┈{#f28fb1-fg}╰━┳┓┏┳┓┏╯{/}┈┈┈
┈┈┈┈┈{#f28fb1-fg}┗┻┛┗┻┛{/}┈┈┈┈`;
    return pigLogo;
  }

  onSelect(cb: Function) {
    this._input.on('select', (_, idx) => cb(idx));
  }

  log(message: string, type?: string) {
    const msg = type === 'error' ? red(message) : message;
    return this._log.log(msg);
  }

  start() {
    this._screen.render();
    this._setWink();
    this._input.focus();
  }

  stop() {
    clearTimeout(this._winkTimeout);
    this._screen.destroy();
  }

  spawn(command: string, args: Array<string> = []) {
    this.log(`🐽 Spawning ${command} ${args.join(' ')} ...`);
    const cmd = spawn(command, args);

    const logData = data => {
      this.log(data.toString());
    };
    const logError = err => {
      this.log(err.toString(), 'error');
    };
    cmd.stdout.on('data', logData);
    cmd.stderr.on('data', logError);
    cmd.on('error', logError);
    cmd.on('close', code => {
      this.log('✨ Done');
      if (code < 1) {
        this._input.focus();
      } else {
        this._screen.onceKey('enter', () => {
          this._input.focus();
        });
      }
    });
  }
}
module.exports = TrufflePigUI;
