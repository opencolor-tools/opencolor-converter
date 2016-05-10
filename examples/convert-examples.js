var fs = require('fs');
var converter = require('../index');

var materialDesignConfig = {
  colorNameProcessor: function(colorName) {
    if(colorName.indexOf(' - Primary') !== -1) {
      colorName = colorName.replace(' - Primary', '');
    }
    var nameParts = colorName.split(" ");
    var groupName = nameParts.slice(0, nameParts.length -1).join(" ");
    colorName = nameParts[nameParts.length - 1];
    return {
      colorName: colorName,
      groupName: groupName
    }
  }
};


var acoPalette = converter.importAco(fs.readFileSync(__dirname + '/Material Palette.aco'), materialDesignConfig);
var ocoStringOfAco = converter.renderOco(acoPalette);

fs.writeFileSync(__dirname + '/converted/Material Palette.oco', ocoStringOfAco, 'utf-8');

var lessPalette = converter.importLess(fs.readFileSync(__dirname + '/bootstrap-variables.less', 'utf-8'));
var ocoStringOfLess = converter.renderOco(lessPalette);

fs.writeFileSync(__dirname + '/converted/bootstrap-variables.oco', ocoStringOfLess, 'utf-8');

var sassPalette = converter.importSass(fs.readFileSync(__dirname + '/foundation-global.scss', 'utf-8'));
var ocoStringOfSass = converter.renderOco(sassPalette);

fs.writeFileSync(__dirname + '/converted/foundation-global.oco', ocoStringOfSass, 'utf-8');

var cssPalette = converter.importCss(fs.readFileSync(__dirname + '/opencolor.tools.css', 'utf-8'));
var ocoStringOfCss = converter.renderOco(cssPalette);

fs.writeFileSync(__dirname + '/converted/opencolor.tools.oco', ocoStringOfCss, 'utf-8');
