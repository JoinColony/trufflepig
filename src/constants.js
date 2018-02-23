/* @flow */

const ganachePlugin = require('./key_plugins/ganache_key_plugin');
const keystorePlugin = require('./key_plugins/keystore_key_plugin');

exports.ACCOUNTS_ENDPOINT = '/accounts';
exports.CONTRACTS_ENDPOINT = '/contracts';
exports.CORS_WHITELIST = ['0.0.0.0', '127.0.0.1', '[::1]', 'localhost'];
exports.DEFAULT_PIG_PORT = 3030;
exports.KEY_PLUGINS = {
  ganache: ganachePlugin,
  keystore: keystorePlugin,
};
