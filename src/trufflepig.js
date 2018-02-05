/* @flow */

import yargs from 'yargs';
import TrufflePig from '.';
import TrufflePigUI from './bin/trufflepigui';

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

const pig = new TrufflePig({
  contractDir: String(args.contractDir),
  port: parseInt(args.port, 10),
  endpoint: String(args.endpoint),
  verbose: !!args.verbose,
});

const cli = new TrufflePigUI(pig, {
  contractDir: String(args.contractDir),
});

cli.start();
