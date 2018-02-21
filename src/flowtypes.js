/* @flow */

// Because of https://github.com/facebook/flow/issues/5113
export type Server = {
  address: () => {
    address: string,
    family: string,
    port: number,
  },
  listen: () => Server,
  close: () => void,
};

type TPCacheOptions = {
  contractDir: string,
  verbose: boolean,
  ganacheKeyFile: string,
  keystoreDir: string,
};

type TPServerOptions = {
  port: number,
  verbose: boolean,
};

export type TPOptions = TPCacheOptions & TPServerOptions;
