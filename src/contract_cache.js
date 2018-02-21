/* @flow */

import TrufflePigCache from './cache';

type TruffleArtifact = {
  abi: Object,
  contractName: string,
  networks?: Object,
};

type Query = {
  isDeployed?: string | Array<string>,
  name?: string | Array<string>,
};

export default class ContractCache extends TrufflePigCache {
  static contractMatchesQuery(
    contract: TruffleArtifact,
    query: Query,
  ): boolean {
    // TODO later: if the need arises, support limiting by fields other than name
    return query.name === contract.contractName;
  }
  contractNames() {
    return {
      contractNames: [...this._cache.values()].map(
        contract => contract.contractName,
      ),
    };
  }
  findContracts(query: Query) {
    return [...this._cache.values()].filter(contract =>
      this.constructor.contractMatchesQuery(contract, query),
    );
  }
  findContract(query: Query) {
    return [...this._cache.values()].find(contract =>
      this.constructor.contractMatchesQuery(contract, query),
    );
  }
}
