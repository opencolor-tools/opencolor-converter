'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exporter = exports.importer = undefined;

var _factory = require('./factory');

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultExporterOptions = {};

var importer = exports.importer = (0, _factory.createImporter)({}, function (input, options) {
  throw new Error('swift import not supported');
});

var exporter = exports.exporter = (0, _factory.createExporter)(defaultExporterOptions, function (tree, options) {
  return new Promise(function (resolve, reject) {
    var lines = [];
    function renderPalette(palette, level) {
      palette.forEach(function (entry) {
        if (entry.type === 'Palette') {
          renderPalette(entry, level + 1);
        } else if (entry.type === 'Color') {
          var entryColor = (0, _color2.default)(entry.hexcolor());

          lines.push('let ' + entry.name + 'Color = UIColor(red: ' + entryColor.red() / 255 + ', green: ' + entryColor.green() / 255 + ', blue: ' + entryColor.blue() / 255 + ', alpha: 1)');
        } else if (entry.type === 'Reference') {
          lines.push('let ' + entry.name + 'Color = ' + entry.refName + 'Color;');
        }
      });
    }
    renderPalette(tree, 0);
    resolve(lines.join('\n'));
  });
});

exports.default = {
  exporter: exporter,
  importer: importer
};