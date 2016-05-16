'use strict';

var binary = require('binary'),
    Color = require("color"),
    oco = require('opencolor'),
    fs = require('fs');

var convert = function convert(buf, config) {

  var config = Object.assign({}, {
    colorNameProcessor: function colorNameProcessor(name) {
      return {
        colorName: name,
        groupName: null
      };
    }
  }, config);

  // https://github.com/teemualap/grunt-aco2less
  var nTotalColors = 0;

  //store palette information in this object
  var colorTable = {};

  //aco1 header information mainly to get color count
  var header = binary.parse(buf).word16be('ver').word16be('nColors').vars;

  var skipOneHeader = 4;

  //skip aco1 section
  var skipSection1 = skipOneHeader + header.nColors * (5 * 2);
  //skip aco2 header
  var toSection2 = skipSection1 + skipOneHeader;

  //count palette iterations
  var colorCount = 0;

  //parse section 2 the first time to get color info and color name field length
  binary.parse(buf).skip(toSection2).loop(function (end, vars) {
    colorCount++;
    if (this.eof()) {
      end();
    }
    this.word16be('colorSpace').word16be('w').word16be('x').word16be('y').word16be('z').word16be('separator').word16be('lenplus1') //let's not parse any further
    .tap(function (vars) {
      //skipping results in an additional iteration so let's not store that one
      //binary module assigns nulls for fields read outside the buffer so we can test the first one.
      if (vars.colorSpace !== null) {
        //an object for each color
        colorTable['color-' + colorCount] = {};
        color = colorTable['color-' + colorCount];
        //store field information in those objects
        for (var i in vars) {
          color[i] = vars[i];
        }
        //give these colors an index number for later use
        color.index = colorCount - 1;

        //skip to the next color
        this.skip(vars.lenplus1 * 2);
      }
    });
  });

  function getColorName(color, skip) {

    var colorName = "";
    var n = 0;

    binary.parse(buf).skip(skip).loop(function (end, vars) {
      n++;
      if (n === color.lenplus1 - 1) {
        //end
        end();
      }
      this.word16be('namepart').tap(function (vars) {
        //hex representation of this part
        var hexPart = vars.namepart.toString(16);
        //ascii representation of this part
        var asciiPart = hexToAscii(hexPart);
        //console.log(asciiPart);
        colorName += asciiPart;
      });
    });

    return colorName;
  }

  var palette = "";
  var ocoPalette = new oco.Entry();

  function hexToAscii(hex) {
    var ascii = "";
    for (var i = 0; i < hex.length; i += 2) {
      ascii += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return ascii;
  }

  var lastNamesLength = 0;
  var groups = {};

  //iterate over our colorTable and store color names
  for (var i in colorTable) {

    nTotalColors++;

    var color = colorTable[i];

    //skip aco1, aco2 header, and previously iterated colors
    var toNextColorName = toSection2 + (color.index + 1) * 14 + lastNamesLength;

    //get color name
    var colorName = getColorName(color, toNextColorName);

    //the length of previous names in bytes
    lastNamesLength = lastNamesLength + color.lenplus1 * 2;

    var group = null;
    var groupName = null;
    var processedName = config.colorNameProcessor(colorName);
    colorName = processedName.colorName;
    groupName = processedName.groupName;

    if (groupName != null) {
      if (Object.keys(groups).indexOf(groupName) != -1) {
        group = groups[groupName];
      } else {
        group = new oco.Entry(groupName, [], 'Palette');
        groups[groupName] = group;
      }
    }

    //calculate color values and write them to the palette
    if (color.colorSpace === 0) {
      //RGB
      var colorValue = Color().rgb(color.w / 256, color.x / 256, color.y / 256);
      var colorEntry = new oco.Entry(colorName, [], 'Color');
      colorEntry.addChild(oco.ColorValue.fromColorValue(colorValue.hexString()), true);
      if (group) {
        group.addChild(colorEntry, [], 'color');
      } else {
        ocoPalette.addChild(colorEntry, [], 'color');
      }
    }
    if (color.colorSpace === 1) {
      console.err("unsupported color space");
    }
  }

  Object.keys(groups).forEach(function (k) {
    ocoPalette.addChild(groups[k]);
  });

  return ocoPalette;
};

// var palette = convert(
//   fs.readFileSync('Material Palette.aco'),
//   {
//     colorNameProcessor: function(colorName) {
//       if(colorName.indexOf(' - Primary') !== -1) {
//         colorName = colorName.replace(' - Primary', '');
//       }
//       var nameParts = colorName.split(" ");
//       var groupName = nameParts.slice(0, nameParts.length -1).join(" ");
//       // console.log(groupName);
//       colorName = nameParts[nameParts.length - 1];
//       return {
//         colorName: colorName,
//         groupName: groupName
//       }
//     }
//   }
// );

// var renderer = new oco.Renderer(palette);
// var ocoString = oco.render(palette);
// console.log(ocoString);

module.exports = convert;