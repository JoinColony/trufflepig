/* @flow */

import Cache from '../cache';

const setup = (
  files: Array<string> | string,
  cb: ({ [string]: string }) => any,
) => {
  const cache = new Cache(files);
  const parse = (_, accounts) => cb(accounts.private_keys);
  console.log('Added ganache cache');

  cache.on('add', parse);
  cache.on('change', parse);
};

export default setup;
