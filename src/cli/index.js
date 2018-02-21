/* @flow */

import yargs from 'yargs';

import TrufflePigUI from './trufflepigui';

const args = yargs
  .usage('$0 path/to/my/contracts [another/path, ...]')
  .options({
    p: {
      alias: 'port',
      describe: 'Port to serve the contracts from',
      type: 'number',
      default: 3030,
    },
    v: {
      alias: 'verbose',
      describe: 'Be extra chatty',
      type: 'boolean',
      default: false,
    },
    c: {
      alias: 'contractDir',
      describe: 'Directory to read contracts from',
      type: 'string',
      default: './build/contracts',
    },
    g: {
      alias: 'ganacheKeyFile',
      describe:
        'Ganache accounts file (.json), will serve accounts under /accounts',
      type: 'string',
    },
    k: {
      alias: 'keystoreDir',
      describe:
        'Directory for keystore files, will serve accounts under /accounts',
      type: 'string',
    },
  })
  .parse();

const pig = new TrufflePigUI({
  contractDir: String(args.contractDir),
  port: parseInt(args.port, 10),
  verbose: !!args.verbose,
  ganacheKeyFile: String(args.ganacheKeyFile),
  keystoreDir: String(args.keystoreDir),
});

(async () => {
  await pig.start();
})();
