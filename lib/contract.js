"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TrufflePigContract = function () {
  function TrufflePigContract(path, artifact) {
    (0, _classCallCheck3.default)(this, TrufflePigContract);

    this._path = path;
    this._artifact = artifact;
  }

  (0, _createClass3.default)(TrufflePigContract, [{
    key: "abi",
    get: function get() {
      return this._artifact.abi;
    }
  }, {
    key: "artifact",
    get: function get() {
      return this._artifact;
    }
  }, {
    key: "isDeployed",
    get: function get() {
      return Object.keys(this._artifact.networks || {}).length > 0;
    }
  }, {
    key: "name",
    get: function get() {
      return this._artifact.contractName;
    }
  }, {
    key: "path",
    get: function get() {
      return this._path;
    }
  }]);
  return TrufflePigContract;
}();

exports.default = TrufflePigContract;