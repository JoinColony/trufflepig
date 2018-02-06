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
    e: {
      alias: 'endpoint',
      describe: 'API endpoint to serve the contracts from',
      type: 'string',
      default: 'contracts',
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
  })
  .parse();

const pig = new TrufflePigUI({
  contractDir: String(args.contractDir),
  port: parseInt(args.port, 10),
  endpoint: String(args.endpoint),
  verbose: !!args.verbose,
});

pig.start();
