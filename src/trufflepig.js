/* @flow */

import yargs from 'yargs';
import TrufflePig from '.';

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
  })
  .parse();

const pig = new TrufflePig({
  paths: args._,
  port: parseInt(args.port, 10),
  endpoint: String(args.endpoint),
  verbose: !!args.verbose,
});

pig.start();
