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

  var parseTree = gonzales.parse(input, {syntax: 'less', rule: 'declaration'});


  var name = null;
  parseTree.traverseByTypes(['ident', 'color'], function(node, index, parent) {
    if (node.is('ident')) {
      // console.log("ident", node);
      name = node.content;
    }
    if (name && node.is('color')) {

      // console.log("color", node);
      var colorValue = Color('#' + node.content);
      var processedNames = config.colorNameProcessor(name);
      var colorName = processedNames.colorName;
      var groupName = processedNames.groupName;
      var group = null;

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

      name = null;
    }
  });

  Object.keys(groups).forEach(function(k) {
    ocoPalette.addChild(groups[k]);
  });

  return ocoPalette;
};

// var less = `
// .hello {
//   $world: #F00;
// }
// `;
// var tree = convert(less);
// console.log(tree);
// console.log(oco.render(tree));

module.exports = convert;
