/* @flow */

type Artifact = {
  abi: Object,
  contractName: string,
  networks?: Object,
};

export default class TrufflePigContract {
  _path: string;
  _artifact: Artifact;

  constructor(path: string, artifact: Artifact) {
    this._path = path;
    this._artifact = artifact;
  }
  get abi() {
    return this._artifact.abi;
  }
  get artifact() {
    return this._artifact;
  }
  get isDeployed() {
    return Object.keys(this._artifact.networks || {}).length > 0;
  }
  get name() {
    return this._artifact.contractName;
  }
  get path() {
    return this._path;
  }
}
