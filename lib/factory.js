"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var defaultConverterOptions = {
  filter: false,
  scope: []
};

var createConverter = exports.createConverter = function createConverter(defaultOptions, enforcedOptions) {
  var func = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  if (func == null) {
    func = enforcedOptions;
    enforcedOptions = {};
  }

  var converter = function converter(input, configuration) {
    var options = Object.assign({}, defaultOptions, defaultConverterOptions, configuration, enforcedOptions);

    return func(input, options);
  };

  converter.configure = function (options) {
    return createConfigurableConverter(converter)(options);
  };
  return converter;
};

var createConfigurableConverter = exports.createConfigurableConverter = function createConfigurableConverter(converter) {
  return function (options) {
    return function (input) {
      return converter(input, options);
    };
  };
};