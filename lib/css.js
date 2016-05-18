'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exporter = exports.importer = undefined;

var _gonzalesPe = require('gonzales-pe');

var _gonzalesPe2 = _interopRequireDefault(_gonzalesPe);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _opencolor = require('opencolor');

var _opencolor2 = _interopRequireDefault(_opencolor);

var _factory = require('./factory');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  return new Promise(function (resolve, reject) {
    var ocoPalette = new _opencolor2.default.Entry();

    var parseTree = _gonzalesPe2.default.parse(input);

    parseTree.traverseByTypes(['ruleset'], function (node, index, parent) {
      var selectors = [];
      // class, id, typeSelector
      node.traverseByTypes(['selector'], function (node, index, parent) {
        var selectorParts = [];
        node.traverseByTypes(options.selectors, function (node, index, parent) {
          node.traverseByTypes(['ident'], function (node, index, parent) {
            selectorParts.push(node.content);
          });
        });
        selectors.push(selectorParts);
        selectorParts = [];
      });
      node.traverseByTypes(['declaration'], function (node, index, parent) {
        var cssProperty = '';
        node.traverseByTypes(['ident', 'color'], function (node, index, parent) {
          if (node.is('ident')) {
            cssProperty = node.content;
          }
          if (node.is('color')) {
            var colorValue = (0, _color2.default)('#' + node.content);
            var colorEntry = new _opencolor2.default.Entry(cssProperty, [_opencolor2.default.ColorValue.fromColorValue(colorValue.hexString())]);
            if (options.groupBySelector) {
              if (options.groupAllSelectors) {
                selectors.forEach(function (group) {
                  var path = group.join(' ') + '.' + cssProperty;
                  ocoPalette.set(path, colorEntry.clone());
                });
              } else {
                var path = selectors[0].join(' ') + '.' + cssProperty;
                ocoPalette.set(path, colorEntry);
              }
            } else {
              ocoPalette.set(cssProperty, colorEntry);
            }
          }
        });
      });
      selectors = [];
    });

    resolve(ocoPalette);
  });
});

function getProperty(entryName, options) {
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
        lines.push('  --' + entry.name + ': ' + entry.hexcolor());
      });
      lines.push('}');
    }
    if (options.mapProperties) {
      tree.exportEntries(function (entry) {
        var propertyName = getProperty(entry.name, options);
        lines.push(propertyName + ': ' + entry.hexcolor());
      });
    }
    resolve(lines.join('\n'));
  });
});

exports.default = {
  exporter: exporter,
  importer: importer
};