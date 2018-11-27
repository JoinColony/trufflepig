/* @flow */

import type { Accounts, CacheObject } from '../flowtypes';

const { Wallet } = require('ethers-wallet');
const Cache = require('../cache');

const getWalletData = async (
  walletData: CacheObject = {},
  password?: string,
) => {
  const serializedWallet = JSON.stringify(walletData);
  const wallet = await Wallet.fromEncryptedWallet(serializedWallet, password);
  return {
    [wallet.address]: wallet.privateKey,
  };
};

const setup = (
  files: Array<string> | string,
  { password, cacheOptions }: Object,
  cb: Accounts => any,
) => {
  const cache = new Cache(files, {
    transform: cacheObject => getWalletData(cacheObject, password),
    ...cacheOptions,
  });
  const parse = () => {
    cb(Object.assign({}, ...cache.values()));
  };
  cache.on('add', parse);
  cache.on('change', parse);
  return cache;
};

module.exports = setup;
