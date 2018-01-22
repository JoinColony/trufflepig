'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API = '/contracts';
var DEFAULT_PORT = 3030;

var TrufflePig = function () {
  function TrufflePig(_ref) {
    var _ref$paths = _ref.paths,
        paths = _ref$paths === undefined ? [] : _ref$paths,
        _ref$port = _ref.port,
        port = _ref$port === undefined ? DEFAULT_PORT : _ref$port,
        _ref$verbose = _ref.verbose,
        verbose = _ref$verbose === undefined ? false : _ref$verbose;
    (0, _classCallCheck3.default)(this, TrufflePig);

    this.createCache({ paths: paths, verbose: verbose });
    this.createServer({ port: port, verbose: verbose });
  }

  (0, _createClass3.default)(TrufflePig, [{
    key: 'apiUrl',
    value: function apiUrl() {
      return '' + this._listener.address() + API;
    }
  }, {
    key: 'createCache',
    value: function createCache(_ref2) {
      var paths = _ref2.paths,
          verbose = _ref2.verbose;

      this._cache = new _cache2.default({ paths: paths, verbose: verbose });
      this._cache.initialize();

      this._cache.on('add', function (path) {
        // eslint-disable-next-line no-console
        if (verbose) console.log('TrufflePig: Cache added: ' + path);
      });

      this._cache.on('change', function (path) {
        // eslint-disable-next-line no-console
        if (verbose) console.log('TrufflePig: Cache changed: ' + path);
      });

      this._cache.on('remove', function (path) {
        // eslint-disable-next-line no-console
        if (verbose) console.log('TrufflePig: Cache removed: ' + path);
      });

      this._cache.on('error', function (error) {
        // eslint-disable-next-line no-console
        if (verbose) console.log('TrufflePig: Error from cache: ' + (error.message || error.stack));
      });
    }
  }, {
    key: 'createServer',
    value: function createServer(_ref3) {
      var _this = this;

      var _ref3$port = _ref3.port,
          port = _ref3$port === undefined ? DEFAULT_PORT : _ref3$port,
          verbose = _ref3.verbose;

      this._server = (0, _express2.default)();

      this._server.get(API, function (_ref4, res) {
        var query = _ref4.query;

        if (Object.keys(query).length > 0) {
          var contract = _this._cache.findContract(query);

          // eslint-disable-next-line no-console
          if (verbose && !contract) console.log('TrufflePig: Unable to find contract matching query ' + JSON.stringify(query));

          return res.json(contract || {});
        }
        return res.json(_this._cache.contractNames());
      });

      this._listener = this._server.listen(port, function () {
        // eslint-disable-next-line no-console
        if (verbose) console.log('TrufflePig: Server listening on ' + port.toString());
      });
    }
  }]);
  return TrufflePig;
}();

exports.default = TrufflePig;