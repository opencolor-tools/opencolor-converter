import gonzales from 'gonzales-pe'
import Color from 'color'
import {Entry, ColorValue, Reference} from 'opencolor'

export const stylsheetImporter = function (input, options, syntax) {
  return new Promise((resolve, reject) => {
    var ocoPalette = new Entry()

    var parseTree = gonzales.parse(input, {syntax: syntax})

    var selectorPropertyGlue = ' - '
    if (options.groupBySelector) {
      selectorPropertyGlue = '.'
    }

    function addEntryWithSelectors (selectors, name, entry) {
      if (!options.useOnlyTheFirstSelector) {
        selectors.forEach((group) => {
          var path = group.join(' ') + selectorPropertyGlue + name
          ocoPalette.set(path, entry.clone())
        })
      } else {
        var path = selectors[0].join(' ') + selectorPropertyGlue + name
        ocoPalette.set(path, entry)
      }
    }

    // console.log(parseTree.toJson())
    // less variables definitions one root level
    parseTree.traverseByTypes(['atrule'], (node, index, parent) => {
      if (node.contains('color')) {
        var variableName = node.first('atkeyword').first('ident').content
        var colorValue = Color('#' + node.first('color').content)
        var colorEntry = new Entry(variableName, [ColorValue.fromColorValue(colorValue.hexString())])
        ocoPalette.set(variableName, colorEntry)
      }
    })

    // scss variables definitions one root level
    parseTree.traverseByTypes(['declaration'], (node, index, parent) => {
      if (node.contains('property') && node.first('property').contains('variable')) {
        var variableName = node.first('property').first('variable').first('ident').content

        if (node.contains('value') && node.first('value').contains('color')) {
          var colorValue = Color('#' + node.first('value').first('color').content)
          var colorEntry = new Entry(variableName, [ColorValue.fromColorValue(colorValue.hexString())])
          ocoPalette.set(variableName, colorEntry)
        } else if (node.contains('value') && node.first('value').contains('variable')) {
          var path = node.first('value').first('variable').first('ident').content
          var refrenceEntry = new Reference(variableName, path)
          ocoPalette.set(variableName, refrenceEntry)
        }
      }
    })
    /*
    // less variable assignments one root level
    parseTree.traverseByTypes(['declaration'], (node, index, parent) => {
      if (node.contains('value') && node.first('value').contains('variable')) {
        var variableName = node.first('property').first('ident').content
        var path = node.first('value').first('variable').first('ident').content
        var refrenceEntry = new Reference(variableName, path)
        ocoPalette.set(variableName, refrenceEntry)
      }
    })
    */
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
            var colorEntry = new Entry(cssProperty, [ColorValue.fromColorValue(colorValue.hexString())])
            addEntryWithSelectors(selectors, cssProperty, colorEntry)
          })
          node.traverseByTypes(['variable'], (node, index, parent) => {
            var refrenceEntry = new Reference(cssProperty, node.first('ident').content)
            addEntryWithSelectors(selectors, cssProperty, refrenceEntry)
          })
        })
      })
      selectors = []
    })

    resolve(ocoPalette)
  })
}

export const stringifyAsStylsheet = (palette, startLevel, propertyNameResolver) => {
  let lines = []
  function stringifyPalette (palette, level) {
    let indent = Array(level).join('  ')
    palette.forEach((entry) => {
      if (entry.type === 'Palette') {
        lines.push(`${indent}${entry.name} {`)
        stringifyPalette(entry, level + 1)
        lines.push(`${indent}`)
      } else if (entry.type === 'Color') {
        lines.push(`${indent}@${entry.name}: ${entry.hexcolor()};`)
      } else if (entry.type === 'Reference') {
        var propertyName = getPropertyName(entry.name, options)
        if (!propertyName) {
          propertyName = entry.name
        }
        lines.push(`${indent}${propertyName}: @${entry.refName};`)
      }
    })
  }

  stringifyPalette(palette, startLevel)
}
