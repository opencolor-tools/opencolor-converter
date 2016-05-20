'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exporter = exports.importer = undefined;

var _stylesheet = require('./stylesheet');

var _factory = require('./factory');

var defaultImporterOptions = {
  selectors: ['class', 'id', 'typeSelector'],
  groupBySelector: true,
  groupAllSelectors: false
};

var defaultExporterOptions = {
  cssvariables: true,
  mapProperties: false,
  propertyMapping: {
    'background-color': function backgroundColor(name) {
      return (/(background|bg|fill)/.test(name)
      );
    },
    'color': function color(name) {
      return (/(color|fg|text|font)/.test(name)
      );
    },
    'border': function border(name) {
      return (/border.*/.test(name)
      );
    }
  }
};

var validSelectors = ['class', 'id', 'typeSelector'];

var importer = exports.importer = (0, _factory.createImporter)(defaultImporterOptions, function (input, options) {
  if (options.selectors && options.selectors.length && options.selectors.some(function (selector) {
    return validSelectors.indexOf(selector) === -1;
  })) {
    return Promise.reject(new Error('Invalid option scope: ' + options.selector.join(', ') + ' - valid elements are ' + validSelectors.join(', ')));
  }
  return (0, _stylesheet.stylsheetImporter)(input, options, 'css');
});

function getPropertyName(entryName, options) {
  return Object.keys(options.propertyMapping).find(function (propertyName) {
    return options.propertyMapping[propertyName](entryName);
  });
}

var exporter = exports.exporter = (0, _factory.createExporter)(defaultExporterOptions, function (tree, options) {
  return new Promise(function (resolve, reject) {
    var lines = [];
    if (options.cssvariables) {
      lines.push(':root {');
      tree.exportEntries(function (entry) {
        if (entry.type === 'Color') {
          lines.push('  --' + entry.name + ': ' + entry.hexcolor());
        }
      });
      lines.push('}');
    }
    if (options.mapProperties) {
      (function () {
        var indent = '';
        var openPalette = null;
        tree.exportEntries(function (entry) {
          if (indent.length && entry.parent !== openPalette) {
            lines.push('}');
            indent = '  ';
            openPalette = null;
          }
          if (entry.type === 'Palette') {
            lines.push(entry.name + ' {');
            indent = '  ';
            openPalette = entry;
          }
          var propertyName = getPropertyName(entry.name, options);
          if (!propertyName) {
            propertyName = entry.name;
          }
          if (entry.type === 'Reference') {
            lines.push('' + indent + propertyName + ': var(' + entry.refName + ')');
          } else if (openPalette && entry.type === 'Color') {
            lines.push(indent + '--' + propertyName + ': ' + entry.hexcolor());
          }
        });
        if (openPalette) {
          lines.push('}');
        }
      })();
    }
    resolve(lines.join('\n'));
  });
});

exports.default = {
  exporter: exporter,
  importer: importer
};