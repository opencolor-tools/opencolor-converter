'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importer = undefined;

var _gonzalesPe = require('gonzales-pe');

var _gonzalesPe2 = _interopRequireDefault(_gonzalesPe);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _opencolor = require('opencolor');

var _opencolor2 = _interopRequireDefault(_opencolor);

var _factory = require('./factory');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOptions = {
  selectors: ['class', 'id', 'typeSelector'],
  groupBySelector: true,
  groupAllSelectors: false
};

var validSelectors = ['class', 'id', 'typeSelector'];

var importer = exports.importer = (0, _factory.createConverter)(defaultOptions, function (input, options) {
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
          console.log(node);
          if (node.is('ident')) {
            cssProperty = node.content;
          }
          if (node.is('color')) {
            console.log(selectors, cssProperty);
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
                console.log(path);
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