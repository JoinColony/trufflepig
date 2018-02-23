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

export type TPOptions = {
  contractDir: string,
  ganacheKeyFile: string,
  keystoreDir: string,
  keystorePassword: string,
  port: number,
  verbose: boolean,
};
