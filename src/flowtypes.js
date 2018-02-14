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

export type GanacheState = {
  accounts?: Array<{ address: string, key: string }>,
};

// That'll do for now
export type GanacheOptions = {
  port?: number,
  startGanache?: boolean,
};

type TPCacheOptions = {
  contractDir: string,
  verbose: boolean,
};

type TPServerOptions = {
  port: number,
  verbose: boolean,
};

export type TPOptions = TPCacheOptions & TPServerOptions;
