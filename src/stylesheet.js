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

    function addEntryWithSelectors (selectors, name, entry) {
      if (options.groupAllSelectors) {
        selectors.forEach((group) => {
          var path = group.join(' ') + selectorPropertyGlue + name
          ocoPalette.set(path, entry.clone())
        })
      } else {
        var path = selectors[0].join(' ') + selectorPropertyGlue + name
        ocoPalette.set(path, entry)
      }
    }

    //console.log(parseTree.toJson())
    // less variables one root level
    parseTree.traverseByTypes(['atrule'], (node, index, parent) => {
      if (node.contains('color')) {
        var variableName = node.first('atkeyword').first('ident').content
        var colorValue = Color('#' + node.first('color').content)
        var colorEntry = new oco.Entry(variableName, [oco.ColorValue.fromColorValue(colorValue.hexString())])
        ocoPalette.set(variableName, colorEntry)
      }
    })
    // less variable assignments one root level
    parseTree.traverseByTypes(['declaration'], (node, index, parent) => {
      if (node.contains('value') && node.first('value').contains('variable')) {
        var variableName = node.first('property').first('ident').content
        var path = node.first('value').first('variable').first('ident').content
        var refrenceEntry = new oco.Reference(variableName, path)
        ocoPalette.set(variableName, refrenceEntry)
      }
    })

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
        node.traverseByTypes(['value'], (node, index, parent) => {
          node.traverseByTypes(['color'], (node, index, parent) => {
            var colorValue = Color('#' + node.content)
            var colorEntry = new oco.Entry(cssProperty, [oco.ColorValue.fromColorValue(colorValue.hexString())])
            addEntryWithSelectors(selectors, cssProperty, colorEntry)
          })
          node.traverseByTypes(['variable'], (node, index, parent) => {
            var refrenceEntry = new oco.Reference(cssProperty, node.first('ident').content)
            addEntryWithSelectors(selectors, cssProperty, refrenceEntry)
          })
        })
      })
      selectors = []
    })

    resolve(ocoPalette)
  })
}
