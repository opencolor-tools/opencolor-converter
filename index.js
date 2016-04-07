var fs = require('fs')
  , oco = require('opencolor')
  , acoConverter = require('./aco.js')
  ;


var materialDesignConfig = {
    colorNameProcessor: function(colorName) {
      if(colorName.indexOf(' - Primary') !== -1) {
        colorName = colorName.replace(' - Primary', '');
      } 
      var nameParts = colorName.split(" ");
      var groupName = nameParts.slice(0, nameParts.length -1).join(" ");
      console.log(groupName);
      colorName = nameParts[nameParts.length - 1];
      return {
        colorName: colorName,
        groupName: groupName
      }
    }
  };

var palette = acoConverter(fs.readFileSync('Material Palette.aco'), materialDesignConfig);
var ocoString = oco.render(palette);

fs.writeFileSync('Material Palette.oco', ocoString, 'utf-8');