"use strict";

var gonzales = require('gonzales-pe'),
    Color = require('color'),
    oco = require('opencolor');

var importer = function importer(input, config) {

  var config = Object.assign({}, {
    colorNameProcessor: function colorNameProcessor(name) {
      name = name.replace('$', '');
      return {
        colorName: name,
        groupName: null
      };
    }
  }, config);

  var ocoPalette = new oco.Entry();
  var groups = {};

  var parseTree = gonzales.parse(input, { syntax: 'less', rule: 'declaration' });

  var name = null;
  parseTree.traverseByTypes(['ident', 'color'], function (node, index, parent) {
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

      if (groupName != null) {
        if (Object.keys(groups).indexOf(groupName) != -1) {
          group = groups[groupName];
        } else {
          group = new oco.Entry(groupName, [], 'Palette');
          groups[groupName] = group;
        }
      }

      var colorEntry = new oco.Entry(colorName, [], 'Color');
      colorEntry.addChild(oco.ColorValue.fromColorValue(colorValue.hexString()), true);
      if (group) {
        group.addChild(colorEntry, [], 'color');
      } else {
        ocoPalette.addChild(colorEntry, [], 'color');
      }

      name = null;
    }
  });

  Object.keys(groups).forEach(function (k) {
    ocoPalette.addChild(groups[k]);
  });

  return ocoPalette;
};

function traverseTree(subtree, path, callback) {
  subtree.forEach(function (entry) {
    if (entry.type === 'Palette') {
      traverseTree(entry, path.concat([entry.name]), callback);
    } else if (entry.type === 'Reference') {
      callback(path, entry.resolved());
    } else {
      callback(path, entry);
    }
  });
}

var exporter = function exporter(ocoTree, config) {
  var colors = {};
  traverseTree(ocoTree, [], function (path, entry) {
    if (entry.type === 'Color') {
      var colorValue = entry.get('rgb').value;
      var colorName = entry.name.replace(' ', '');
      var fullPath = path.join(".").replace(' ', '');
      var dotPath = fullPath + "-" + colorName;
      dotPath = dotPath.toLowerCase();

      colors[dotPath] = colorValue;
    }
  });

  var str = "//\n";
  str += "// automatic export from oco\n\n";

  for (var key in colors) {
    str += "@" + key + ": " + colors[key] + ";\n";
  }

  return str;
};

module.exports = {
  import: importer,
  export: exporter
};