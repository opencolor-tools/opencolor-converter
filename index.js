var oco = require('opencolor');
var acoConverter = require('./aco.js');
var lessConverter = require('./less.js');
var cssConverter = require('./css.js');

var converter = {
  importAco: function importAco(data, config) {
    return acoConverter(data, config);
  },

  importLess: function importLess(data, config) {
    return lessConverter.import(data, config);
  },

  importCss: function importLess(data, config) {
    return cssConverter(data, config);
  },

  exportLess: function exportLess(ocoTree, config) {
    return lessConverter.export(ocoTree, config);
  },

  renderOco: function renderOco(ocoTree) {
    return oco.render(ocoTree);
  }
};

module.exports = converter;
