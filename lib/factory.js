'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var defaultImporterOptions = {};

var defaultExporterOptions = {
  filter: false,
  scope: []
};

var validScopes = ['Color', 'Reference', 'Palette'];

var createImporter = exports.createImporter = function createImporter(defaultOptions, enforcedOptions) {
  var func = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (func == null) {
    func = enforcedOptions;
    enforcedOptions = {};
  }

  var importer = function importer(input, configuration) {
    var options = _extends({}, defaultOptions, defaultImporterOptions, configuration, enforcedOptions);

    return func(input, options);
  };

  importer.configure = function (options) {
    return createConfigurableConverter(importer)(options);
  };
  return importer;
};

var createExporter = exports.createExporter = function createExporter(defaultOptions, enforcedOptions) {
  var func = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (func == null) {
    func = enforcedOptions;
    enforcedOptions = {};
  }

  var exporter = function exporter(tree, configuration) {
    var toBeExported = tree.clone();
    var options = _extends({}, defaultOptions, defaultExporterOptions, configuration, enforcedOptions);

    if (typeof options.scope === 'string') {
      options.scope = [options.scope];
    }
    if (options.scope && options.scope.length && options.scope.some(function (scope) {
      return validScopes.indexOf(scope) === -1;
    })) {
      return Promise.reject(new Error('Invalid option scope: ' + options.scope.join(', ') + ' - valid elements are ' + validScopes.join(', ')));
    }
    var isInSearchScope = function isInSearchScope() {
      return true;
    };
    if (options.filter) {
      if (options.filter instanceof RegExp) {
        isInSearchScope = function isInSearchScope(term) {
          return options.filter.test(term);
        };
      } else {
        isInSearchScope = function isInSearchScope(term) {
          return term.indexOf(options.filter) !== -1;
        };
      }
    }
    toBeExported.exportEntries = function (cb) {
      toBeExported.traverseTree(options.scope, function (entry) {
        if (!isInSearchScope(entry.name)) {
          return;
        }
        cb(entry);
      });
    };
    return func(toBeExported, options);
  };

  exporter.configure = function (options) {
    return createConfigurableConverter(exporter)(options);
  };
  return exporter;
};

var createConfigurableConverter = exports.createConfigurableConverter = function createConfigurableConverter(converter) {
  return function (options) {
    return function (input) {
      return converter(input, options);
    };
  };
};