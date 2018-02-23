/* @flow */

const yargs = require('yargs');

const TrufflePigUI = require('./ui');

const args = yargs
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
    s: {
      alias: 'keystorePassword',
      describe: 'Password to decrypt keystore files',
    },
  })
  .parse();

const pig = new TrufflePigUI({
  contractDir: String(args.contractDir),
  port: parseInt(args.port, 10),
  verbose: !!args.verbose,
  ganacheKeyFile: String(args.ganacheKeyFile),
  keystoreDir: String(args.keystoreDir),
  keystorePassword: String(args.keystorePassword),
});

pig.start();
