/* @flow */

import ganachePlugin from './key_plugins/ganache_key_plugin';
import keystorePlugin from './key_plugins/keystore_key_plugin';

export const ACCOUNTS_ENDPOINT = '/accounts';
export const CONTRACTS_ENDPOINT = '/contracts';
export const CORS_WHITELIST = ['0.0.0.0', '127.0.0.1', '[::1]', 'localhost'];
export const DEFAULT_PIG_PORT = 3030;
export const KEY_PLUGINS = {
  ganache: ganachePlugin,
  keystore: keystorePlugin,
};
