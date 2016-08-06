'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exporter = exports.importer = undefined;

var _factory = require('./factory');

var _opencolor = require('opencolor');

var _color = require('color');

var _color2 = _interopRequireDefault(_color);

var _binary = require('binary');

var _binary2 = _interopRequireDefault(_binary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultImporterOptions = {};

var importer = exports.importer = (0, _factory.createImporter)(defaultImporterOptions, function (input, options) {
  return new Promise(function (resolve, reject) {
    var buf = input;
    var ocoPalette = new _opencolor.Entry();

    // https:// github.com/teemualap/grunt-aco2less
    var nTotalColors = 0;

    // store palette information in this object
    var colorTable = {};

    // aco1 header information mainly to get color count
    var header = _binary2.default.parse(buf).word16be('ver').word16be('nColors').vars;

    var skipOneHeader = 4;

    // skip aco1 section
    var skipSection1 = skipOneHeader + header.nColors * (5 * 2);
    // skip aco2 header
    var toSection2 = skipSection1 + skipOneHeader;

    // count palette iterations
    var colorCount = 0;

    // parse section 2 the first time to get color info and color name field length
    _binary2.default.parse(buf).skip(toSection2).loop(function (end, vars) {
      colorCount++;
      if (this.eof()) {
        end();
      }
      this.word16be('colorSpace').word16be('w').word16be('x').word16be('y').word16be('z').word16be('separator').word16be('lenplus1') // let's not parse any further
      .tap(function (vars) {
        // skipping results in an additional iteration so let's not store that one
        // binary module assigns nulls for fields read outside the buffer so we can test the first one.
        if (vars.colorSpace !== null) {
          // an object for each color
          colorTable['color-' + colorCount] = {};
          color = colorTable['color-' + colorCount];
          // store field information in those objects
          for (var i in vars) {
            color[i] = vars[i];
          }
          // give these colors an index number for later use
          color.index = colorCount - 1;

          // skip to the next color
          this.skip(vars.lenplus1 * 2);
        }
      });
    });

    function getColorName(color, skip) {
      var colorName = '';
      var n = 0;

      _binary2.default.parse(buf).skip(skip).loop(function (end, vars) {
        n++;
        if (n === color.lenplus1 - 1) {
          // end
          end();
        }
        this.word16be('namepart').tap(function (vars) {
          // hex representation of this part
          var hexPart = vars.namepart.toString(16);
          // ascii representation of this part
          var asciiPart = hexToAscii(hexPart);
          // console.log(asciiPart)
          colorName += asciiPart;
        });
      });

      return colorName;
    }

    function hexToAscii(hex) {
      var ascii = '';
      for (var i = 0; i < hex.length; i += 2) {
        ascii += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return ascii;
    }

    var lastNamesLength = 0;

    // iterate over our colorTable and store color names
    for (var i in colorTable) {
      var path = [];

      nTotalColors++;

      var color = colorTable[i];

      // skip aco1, aco2 header, and previously iterated colors
      var toNextColorName = toSection2 + (color.index + 1) * 14 + lastNamesLength;

      // get color name
      var colorName = getColorName(color, toNextColorName);

      // the length of previous names in bytes
      lastNamesLength = lastNamesLength + color.lenplus1 * 2;

      // calculate color values and write them to the palette
      if (color.colorSpace === 0) {
        // RGB
        var colorValue = (0, _color2.default)().rgb(Math.floor(color.w / 256), Math.floor(color.x / 256), Math.floor(color.y / 256));
        var colorEntry = new _opencolor.Entry(colorName, [_opencolor.ColorValue.fromColorValue(colorValue.hexString())]);

        path.push(colorName);

        ocoPalette.set(path.join('.'), colorEntry);
      }
      if (color.colorSpace === 1) {
        throw new Error('unsupported color space');
      }
    }
    resolve(ocoPalette);
  });
});

var exporter = exports.exporter = (0, _factory.createExporter)({}, function (tree, options) {
  throw new Error('aco export not supported');
});

exports.default = {
  importer: importer,
  exporter: exporter
};