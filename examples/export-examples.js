var converter = require('../index');
var oco = require('opencolor');

var ocoSource = `
Brand Colors:
  oct/:
    view: stretched
    showColorInfo: true
    showColorValue: false
  Deep Blue: #1A237E
  Funky Orange: #FF7043
Blues:
  oct/view: minimal
  800: #1565C0
  50: #E3F2FD
`

var ocoTree = oco.parse(ocoSource);
var lessStr = converter.exportLess(ocoTree);

console.log(lessStr)
