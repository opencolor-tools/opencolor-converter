var oco = require('opencolor');
var acoConverter = require('./aco.js');
var lessConverter = require('./less.js');

var converter = {
  importAco: function importAco(data, config) {
    return acoConverter(data, config);
  },

  importLess: function importLess(data, config) {
    return lessConverter(data, config);
  },

  renderOco: function renderOco(ocoTree) {
    return oco.render(ocoTree);
  }
};

module.exports = converter;
