'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _contract = require('./contract');

var _contract2 = _interopRequireDefault(_contract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TrufflePigCache = function (_EventEmitter) {
  (0, _inherits3.default)(TrufflePigCache, _EventEmitter);
  (0, _createClass3.default)(TrufflePigCache, null, [{
    key: 'contractMatchesQuery',
    value: function contractMatchesQuery(contract, query) {
      return Object.keys(query).every(function (key) {
        var value = query[key];
        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        }
        return contract[key] === value;
      });
    }
  }, {
    key: 'parseContract',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(path) {
        var artifact;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.t0 = JSON;
                _context.next = 3;
                return new Promise(function (resolve, reject) {
                  _fs2.default.readFile(path, function (error, body) {
                    return error ? reject(error) : resolve(body);
                  });
                });

              case 3:
                _context.t1 = _context.sent;
                artifact = _context.t0.parse.call(_context.t0, _context.t1);
                return _context.abrupt('return', new _contract2.default(path, artifact));

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function parseContract(_x) {
        return _ref.apply(this, arguments);
      }

      return parseContract;
    }()
  }]);

  function TrufflePigCache(_ref2) {
    var _this2 = this;

    var paths = _ref2.paths;
    (0, _classCallCheck3.default)(this, TrufflePigCache);

    var _this = (0, _possibleConstructorReturn3.default)(this, (TrufflePigCache.__proto__ || Object.getPrototypeOf(TrufflePigCache)).call(this));

    _this._contracts = new Map();
    _this._watcher = _chokidar2.default.watch(paths, {
      persistent: true
    });
    _this._watcher.on('add', function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(path) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', _this.add(path));

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this2);
      }));

      return function (_x2) {
        return _ref3.apply(this, arguments);
      };
    }()).on('change', function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(path) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt('return', _this.change(path));

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2);
      }));

      return function (_x3) {
        return _ref4.apply(this, arguments);
      };
    }()).on('error', function (error) {
      return _this.emit('error', error);
    }).on('unlink', function (path) {
      return _this.remove(path);
    });
    return _this;
  }

  (0, _createClass3.default)(TrufflePigCache, [{
    key: 'add',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(path) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!this._contracts.has(path)) {
                  _context4.next = 2;
                  break;
                }

                return _context4.abrupt('return');

              case 2:
                _context4.t0 = this._contracts;
                _context4.t1 = path;
                _context4.next = 6;
                return this.constructor.parseContract(path);

              case 6:
                _context4.t2 = _context4.sent;

                _context4.t0.set.call(_context4.t0, _context4.t1, _context4.t2);

                this.emit('add', path);

              case 9:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function add(_x4) {
        return _ref5.apply(this, arguments);
      }

      return add;
    }()
  }, {
    key: 'change',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(path) {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.t0 = this._contracts;
                _context5.t1 = path;
                _context5.next = 4;
                return this.constructor.parseContract(path);

              case 4:
                _context5.t2 = _context5.sent;

                _context5.t0.set.call(_context5.t0, _context5.t1, _context5.t2);

                this.emit('change', path);

              case 7:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function change(_x5) {
        return _ref6.apply(this, arguments);
      }

      return change;
    }()
  }, {
    key: 'remove',
    value: function remove(path) {
      this._contracts.delete(path);
      this.emit('remove', path);
    }
  }, {
    key: 'contractNames',
    value: function contractNames() {
      return {
        contractNames: [].concat((0, _toConsumableArray3.default)(this._contracts.values())).map(function (contract) {
          return contract.name;
        })
      };
    }
  }, {
    key: 'findContracts',
    value: function findContracts(query) {
      var _this3 = this;

      return [].concat((0, _toConsumableArray3.default)(this._contracts.values())).find(function (contract) {
        return _this3.constructor.contractMatchesQuery(contract, query);
      }).map(function (contract) {
        return contract.artifact;
      });
    }
  }, {
    key: 'findContract',
    value: function findContract(query) {
      var _this4 = this;

      return [].concat((0, _toConsumableArray3.default)(this._contracts.values())).find(function (contract) {
        return _this4.constructor.contractMatchesQuery(contract, query);
      })[0];
    }
  }]);
  return TrufflePigCache;
}(_events2.default);

exports.default = TrufflePigCache;