'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exporter = exports.importer = undefined;

var _factory = require('./factory');

var _opencolor = require('opencolor');

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultImporterOptions = {}; /*
                                 
                                 FORMAT EXAMPLE:
                                 
                                 {
                                   "metadata": {
                                     "oct": {
                                       "defaultView": "grid"
                                     }
                                   },
                                   "colorGroups": [
                                     {
                                       "name": "grey",
                                       "metadata": {
                                         "namespace": {
                                           "priority": 0
                                         }
                                       },
                                       "shades": {
                                         "10": "#FBFBFB"
                                       }
                                     }
                                   ]
                                 }
                                 
                                 */

var defaultExporterOptions = {
  exportMetadata: true
};

var importer = exports.importer = (0, _factory.createImporter)(defaultImporterOptions, function (input, options) {
  throw new Error('JSON import not supported');
});

var exporter = exports.exporter = (0, _factory.createExporter)(defaultExporterOptions, function (tree, options) {
  function processMetadata(entry) {
    if (!options.exportMetadata) return null;

    var metadata = {};

    entry.metadata.keys().forEach(function (key) {
      var context = key.split('/')[0];
      var attribute = key.split('/')[1];
      if (!metadata[context]) metadata[context] = {};
      var value = entry.metadata.get(key);
      if (value.type === 'Reference') value = '=' + value.refName;
      metadata[context][attribute] = value;
    });

    return metadata;
  }

  return new Promise(function (resolve, reject) {
    var out = {
      metadata: processMetadata(tree),
      colorGroups: []
    };
    if (!options.exportMetadata) delete out.metadata;

    var currentPalette = null;
    tree.exportEntries(function (entry) {
      if (entry.type === 'Palette') {
        currentPalette = {
          name: entry.name,
          metadata: processMetadata(entry),
          shades: {}
        };
        if (!options.exportMetadata) delete currentPalette.metadata;
        out.colorGroups.push(currentPalette);
      } else if (entry.type === 'Color') {
        currentPalette.shades[entry.name] = entry.hexcolor();
      } else if (entry.type === 'Reference') {
        currentPalette.shades[entry.name] = '=' + entry.refName;
      }
    });

    resolve(JSON.stringify(out, null, '  '));
  });
});

exports.default = {
  exporter: exporter,
  importer: importer
};