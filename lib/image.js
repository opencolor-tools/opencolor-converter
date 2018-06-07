'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exporter = exports.importer = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _factory = require('./factory');

var _opencolor = require('opencolor');

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _nodeVibrant = require('node-vibrant');

var _nodeVibrant2 = _interopRequireDefault(_nodeVibrant);

var _getImageColors = require('get-image-colors');

var _getImageColors2 = _interopRequireDefault(_getImageColors);

var _fileType = require('file-type');

var _fileType2 = _interopRequireDefault(_fileType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultImporterOptions = {
  importer: 'basic',
  colors: 8
};

var importer = exports.importer = (0, _factory.createImporter)(defaultImporterOptions, function (input, options) {
  if (options.importer === 'vibrant') {
    return new Promise(function (resolve, reject) {
      _nodeVibrant2.default.from(input).getPalette(function (err, palette) {
        if (err) {
          Promise.reject(err);
        }

        var paletteJson = {};

        for (var key in palette) {
          if (palette[key] !== null) {
            paletteJson[key] = palette[key].getHex();
          }
        }

        paletteJson = JSON.stringify(paletteJson);

        var tree = null;

        try {
          tree = JSON.parse(paletteJson);
        } catch (e) {
          Promise.reject(e);
        }

        var ocoPalette = new _opencolor.Entry();

        function walk(key, value, path, parent, level) {
          path = path.slice(0);
          if (Object.prototype.toString.call(value) === '[object Array]') {
            path.push(key);
            value.forEach(function (item, index) {
              walk(index, item, path, value, level + 1);
            });
          } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
            path.push(key);
            Object.keys(value).forEach(function (k) {
              walk(k, value[k], path, value, level + 1);
            });
          } else {
            var colorValue = null;
            try {
              colorValue = (0, _color2.default)(value);
            } catch (e) {}
            if (colorValue) {
              var name = key;
              if (options.readNameFromKey && (typeof parent === 'undefined' ? 'undefined' : _typeof(parent)) === 'object' && options.keyForName in parent) {
                name = parent[options.keyForName];
              }
              var color = new _opencolor.Entry(name, [_opencolor.ColorValue.fromColorValue(colorValue.hexString())]);
              path.push(name);
              ocoPalette.set(path.join('.'), color);
            }
          }
        }
        Object.keys(tree).forEach(function (k) {
          walk(k, tree[k], [], tree, 0);
        });

        resolve(ocoPalette);
      });
    });
  } else {
    return new Promise(function (resolve, reject) {
      var mimeType = (0, _fileType2.default)(input).mime;

      (0, _getImageColors2.default)(input, mimeType, options.colors, function (err, palette) {
        if (err) {
          Promise.reject(err);
        }

        var paletteJson = {};

        for (var i = 0; i < palette.length; i++) {
          paletteJson['Color ' + (i + 1)] = palette[i].hex();
        }

        paletteJson = JSON.stringify(paletteJson);

        var tree = null;

        try {
          tree = JSON.parse(paletteJson);
        } catch (e) {
          Promise.reject(e);
        }

        var ocoPalette = new _opencolor.Entry();

        function walk(key, value, path, parent, level) {
          path = path.slice(0);
          if (Object.prototype.toString.call(value) === '[object Array]') {
            path.push(key);
            value.forEach(function (item, index) {
              walk(index, item, path, value, level + 1);
            });
          } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
            path.push(key);
            Object.keys(value).forEach(function (k) {
              walk(k, value[k], path, value, level + 1);
            });
          } else {
            var colorValue = null;
            try {
              colorValue = (0, _color2.default)(value);
            } catch (e) {}
            if (colorValue) {
              var name = key;
              if (options.readNameFromKey && (typeof parent === 'undefined' ? 'undefined' : _typeof(parent)) === 'object' && options.keyForName in parent) {
                name = parent[options.keyForName];
              }
              var color = new _opencolor.Entry(name, [_opencolor.ColorValue.fromColorValue(colorValue.hexString())]);
              path.push(name);
              ocoPalette.set(path.join('.'), color);
            }
          }
        }
        Object.keys(tree).forEach(function (k) {
          walk(k, tree[k], [], tree, 0);
        });

        resolve(ocoPalette);
      });
    });
  }
});

var exporter = exports.exporter = (0, _factory.createExporter)({}, function (tree, options) {
  throw new Error('image export not supported');
});

exports.default = {
  exporter: exporter,
  importer: importer
};