"use strict";
var gonzales = require('gonzales-pe')
  , Color = require('color')
  , oco = require('opencolor')
  ;

var convert = function(input, config) {

  var config = Object.assign({}, {
    colorNameProcessor: function(name) {
      name = name.replace('$', '');
      return {
        colorName: name,
        groupName: null
      };
    }
  }, config);

  var ocoPalette = new oco.Entry('Root');
  var groups = {};

  var parseTree = gonzales.parse(input);

  var name = '';
  var colorName = '';
  parseTree.traverseByTypes(['selector', 'ident', 'color'], function(node, index, parent) {
    if (node.is('selector')) {
      name = '';
      var classes = node.first('class');
      if(node.first('class')) {
        name = classes.first('ident').content;
      }
    }

    if (node.is('ident')) {
      colorName = node.content;
    }
    if (name != '' && colorName != '' && node.is('color')) {

      var colorValue = Color('#' + node.content);
      var processedNames = config.colorNameProcessor(name);
      var colorName = processedNames.colorName;
      var group = processedNames.groupName;
      
      if(group != null) {
        if(Object.keys(groups).indexOf(groupName) != -1) {
          group = groups[groupName];
        } else {
          group = new oco.Entry(groupName, [], 'Entry');
          groups[groupName] = group;
        }
      }

      var colorEntry = new oco.Entry(colorName, [], 'Color');
      colorEntry.addChild(oco.ColorValue.fromColorValue(colorValue.hexString()), true);
      if(group) {
        group.addChild(colorEntry, [], 'color');
      } else {
        ocoPalette.addChild(colorEntry, [], 'color');
      }

      name = '';
      colorName = '';
    }
  });

  return ocoPalette;
};

module.exports = convert;