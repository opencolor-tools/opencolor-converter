'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stylsheetImporter = undefined;

var _gonzalesPe = require('gonzales-pe');

var _gonzalesPe2 = _interopRequireDefault(_gonzalesPe);

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _opencolor = require('opencolor');

var _opencolor2 = _interopRequireDefault(_opencolor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stylsheetImporter = exports.stylsheetImporter = function stylsheetImporter(input, options, syntax) {
  return new Promise(function (resolve, reject) {
    var ocoPalette = new _opencolor2.default.Entry();

    var parseTree = _gonzalesPe2.default.parse(input, { syntax: syntax });

    var selectorPropertyGlue = ' - ';
    if (options.groupBySelector) {
      selectorPropertyGlue = '.';
    }

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
        node.traverseByTypes(['property'], function (node, index, parent) {
          node.traverseByTypes(['ident'], function (node, index, parent) {
            cssProperty = node.content;
          });
        });
        node.traverseByTypes(['color'], function (node, index, parent) {
          var colorValue = (0, _color2.default)('#' + node.content);
          var colorEntry = new _opencolor2.default.Entry(cssProperty, [_opencolor2.default.ColorValue.fromColorValue(colorValue.hexString())]);
          if (options.groupAllSelectors) {
            selectors.forEach(function (group) {
              var path = group.join(' ') + selectorPropertyGlue + cssProperty;
              ocoPalette.set(path, colorEntry.clone());
            });
          } else {
            var path = selectors[0].join(' ') + selectorPropertyGlue + cssProperty;
            ocoPalette.set(path, colorEntry);
          }
        });
      });
      selectors = [];
    });

    resolve(ocoPalette);
  });
};