/* @flow */

import chalk from 'chalk';

const b = chalk.bold.blue;
const r = chalk.bold.red;
const g = chalk.bold.green;
const p = chalk.hex('#f28fb1');

const printMainMenu = (status, config) => {
  const ganacheStatus = status.ganacheReady ? `started on port ${b(config.ganacheOpts.port)}` : 'not started';
  const pigStatus = status.apiUrl ? `serving contracts at ${b(status.apiUrl)}` : 'initializing...';
  const statusMsg = status.message instanceof Error ? r(`ERROR: ${status.message.message}`) : g(status.message);

  console.log('\x1Bc'); // clear screen
  console.log(`
    ${p('TRUFFLEPIG')} - Serving finest truffles since 2017
    -----------------------------------------------
    Reading contracts from ${b(config.trufflePigOpts.contractDir)}
    Pig ${pigStatus}
    Ganache server ${ganacheStatus}
  `);
  console.log(`
    ┈┈${p('┏━╮╭━┓')}┈┈┈┈┈┈┈     What do you want your pig to do?
    ┈┈${p('┃┏┗┛┓┃')}┈┈┈┈┈┈┈     --------------------------------
    ┈┈${p('╰┓OO┏╯')}┈┈┈┈┈┈┈     restart ${b('(g)')}anache-cli
    ┈${p('╭━┻╮╲┗━━━━╮╭╮')}┈     re${b('(d)')}eploy contracts
    ┈${p('┃▎▎┃╲╲╲╲╲╲┣━╯')}┈     start ${b('(t)')}ruffle console
    ┈${p('╰━┳┻▅╯╲╲╲╲┃')}┈┈┈     ${b('(q)')}uit
    ┈┈┈${p('╰━┳┓┏┳┓┏╯')}┈┈┈
    ┈┈┈┈┈${p('┗┻┛┗┻┛')}┈┈┈┈

    ${status.message ? `STATUS: ${statusMsg}` : ''}
  `);
};

export default printMainMenu;
