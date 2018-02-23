/* @flow */

import Cache from '../cache';

const setup = (
  files: Array<string> | string,
  opts: Object,
  cb: ({ [string]: string }) => any,
) => {
  const cache = new Cache(files);
  // eslint-disable-next-line camelcase
  const parse = (_, { private_keys }) => {
    // We have to normalize the keys here and append 0x
    const keys = Object.keys(private_keys).reduce((res, address) => {
      const rawKey = private_keys[address];
      const key = rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;
      res[address] = key;
      return res;
    }, {});
    cb(keys);
  };

  cache.on('add', parse);
  cache.on('change', parse);
  return cache;
};

export default setup;
