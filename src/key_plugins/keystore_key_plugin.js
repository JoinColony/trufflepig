/* @flow */

const { Wallet } = require('ethers-wallet');
const Cache = require('../cache');

const getWalletData = async (walletData, password) => {
  const serializedWallet = JSON.stringify(walletData);
  const wallet = await Wallet.fromEncryptedWallet(serializedWallet, password);
  return {
    [wallet.address]: wallet.privateKey,
  };
};

const setup = (
  files: Array<string> | string,
  opts: Object,
  cb: ({ [string]: string }) => any,
) => {
  const cache = new Cache(files, {
    transform: cacheObject => getWalletData(cacheObject, opts.password),
  });
  const parse = () => {
    cb(Object.assign({}, ...cache.values()));
  };
  cache.on('add', parse);
  cache.on('change', parse);
  return cache;
};

module.exports = setup;
