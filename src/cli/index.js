/* @flow */

import yargs from 'yargs';

import TrufflePigUI from './trufflepigui';
import { DEFAULT_GANACHE_PORT } from '../constants';

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
    gp: {
      alias: 'ganachePort',
      describe: 'Port to run Ganache on',
      type: 'number',
      default: DEFAULT_GANACHE_PORT,
    },
    sg: {
      alias: 'startGanache',
      describe: 'Flag for whether to start Ganache',
      type: 'boolean',
      default: true,
    },
  })
  .parse();

const pig = new TrufflePigUI(
  {
    contractDir: String(args.contractDir),
    port: parseInt(args.port, 10),
    verbose: !!args.verbose,
  },
  {
    port: parseInt(args.ganachePort, 10),
    startGanache: !!args.startGanache,
  },
);

(async () => {
  await pig.start();
})();
