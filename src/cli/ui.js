/* @flow */

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const chalk = require('chalk');

const { red } = chalk;

class TrufflePigUI {
  static createScreen() {
    return blessed.screen({
      smartCSR: true,
      title: 'trufflepig',
    });
  }
  static createLogo() {
    return blessed.box({
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
    return contrib.log({
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
      top: 1,
      left: 26,
      width: '100%-31',
      height: 8,
      label: 'What do you want your pig to do?',
      items: ['Start the truffle console', 'Redeploy contracts', 'Exit'],
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

    const pigLogo = `
    ┈┈{#f28fb1-fg}┏━╮╭━┓{/}┈┈┈┈┈┈┈
    ┈┈{#f28fb1-fg}┃┏┗┛┓┃{/}┈┈┈┈┈┈┈
    ┈┈{#f28fb1-fg}╰┓{/}{#ffffff-fg}${eyes()}{/}{#f28fb1-fg}┏╯{/}┈┈┈┈┈┈┈
    ┈{#f28fb1-fg}╭━┻╮╲┗━━━━╮╭╮{/}┈
    ┈{#f28fb1-fg}┃▎▎┃╲╲╲╲╲╲┣━╯{/}┈
    ┈{#f28fb1-fg}╰━┳┻▅╯╲╲╲╲┃{/}┈┈┈
    ┈┈┈{#f28fb1-fg}╰━┳┓┏┳┓┏╯{/}┈┈┈
    ┈┈┈┈┈{#f28fb1-fg}┗┻┛┗┻┛{/}┈┈┈┈
    `;

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
}

module.exports = TrufflePigUI;
