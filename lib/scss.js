'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exporter = exports.importer = undefined;

var _stylesheet = require('./stylesheet');

var _factory = require('./factory');

var defaultImporterOptions = {
  selectors: ['class', 'id', 'typeSelector'],
  groupBySelector: false,
  useOnlyTheFirstSelector: false
};

var defaultExporterOptions = {
  mapProperties: true,
  allAsVars: false,
  propertyMapping: {
    'background-color': function backgroundColor(name) {
      return (/(background|bg|fill)/.test(name)
      );
    },
    'color': function color(name) {
      return (/(color|fg|text|font|text-color)/.test(name)
      );
    },
    'border-color': function borderColor(name) {
      return (/(border|stroke|border-color|stroke-color).*/.test(name)
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
  return (0, _stylesheet.stylsheetImporter)(input, options, 'scss');
});

function getPropertyName(entryName, options) {
  if (!options.mapProperties) {
    return entryName;
  }
  var propertyName = Object.keys(options.propertyMapping).find(function (propertyName) {
    return options.propertyMapping[propertyName](entryName);
  });
  return propertyName || entryName;
}

function isColorProperty(entryName, options) {
  for (var colorProperty in options.propertyMapping) {
    if (colorProperty === entryName) {
      return true;
    }
  }

  return false;
}

var exporter = exports.exporter = (0, _factory.createExporter)(defaultExporterOptions, function (tree, options) {
  return new Promise(function (resolve, reject) {
    var lines = [];
    function renderPalette(palette, level) {
      var indent = Array(level + 1).join('  ');

      palette.forEach(function (entry) {
        if (entry.type === 'Palette') {
          lines.push('' + indent + entry.name + ' {');
          renderPalette(entry, level + 1);
          lines.push(indent + '}');
        } else if (entry.type === 'Color') {
          var propertyName = getPropertyName(entry.name, options);

          if (options.allAsVars || level === 0 || !isColorProperty(propertyName, options)) {
            lines.push(indent + '$' + propertyName + ': ' + entry.hexcolor() + ';');
          } else {
            lines.push('' + indent + propertyName + ': ' + entry.hexcolor() + ';');
          }
        } else if (entry.type === 'Reference') {
          propertyName = getPropertyName(entry.name, options);

          if (options.allAsVars || level === 0 || !isColorProperty(propertyName, options)) {
            lines.push(indent + '$' + propertyName + ': $' + entry.refName + ';');
          } else {
            lines.push('' + indent + propertyName + ': $' + entry.refName + ';');
          }
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