import gonzales from 'gonzales-pe'
import Color from 'color'
import oco from 'opencolor'

export const stylsheetImporter = function (input, options, syntax) {
  return new Promise((resolve, reject) => {
    var ocoPalette = new oco.Entry()

    var parseTree = gonzales.parse(input, {syntax: syntax})

    var selectorPropertyGlue = ' - '
    if (options.groupBySelector) {
      selectorPropertyGlue = '.'
    }

    parseTree.traverseByTypes(['ruleset'], (node, index, parent) => {
      var selectors = []
      // class, id, typeSelector
      node.traverseByTypes(['selector'], (node, index, parent) => {
        var selectorParts = []
        node.traverseByTypes(options.selectors, (node, index, parent) => {
          node.traverseByTypes(['ident'], (node, index, parent) => {
            selectorParts.push(node.content)
          })
        })
        selectors.push(selectorParts)
        selectorParts = []
      })
      node.traverseByTypes(['declaration'], (node, index, parent) => {
        var cssProperty = ''
        node.traverseByTypes(['property'], (node, index, parent) => {
          node.traverseByTypes(['ident'], (node, index, parent) => {
            cssProperty = node.content
          })
        })
        node.traverseByTypes(['color'], (node, index, parent) => {
          var colorValue = Color('#' + node.content)
          var colorEntry = new oco.Entry(cssProperty, [oco.ColorValue.fromColorValue(colorValue.hexString())])
          if (options.groupAllSelectors) {
            selectors.forEach((group) => {
              var path = group.join(' ') + selectorPropertyGlue + cssProperty
              ocoPalette.set(path, colorEntry.clone())
            })
          } else {
            var path = selectors[0].join(' ') + selectorPropertyGlue + cssProperty
            ocoPalette.set(path, colorEntry)
          }
        })
      })
      selectors = []
    })

    resolve(ocoPalette)
  })
}
