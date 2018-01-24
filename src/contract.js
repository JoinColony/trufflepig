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
  get abi(): Object {
    return this._artifact.abi;
  }
  get artifact(): Artifact {
    return this._artifact;
  }
  get isDeployed(): boolean {
    return Object.keys(this._artifact.networks || {}).length > 0;
  }
  get name(): string {
    return this._artifact.contractName;
  }
  get path(): string {
    return this._path;
  }
}
