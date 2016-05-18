import gonzales from 'gonzales-pe'
import Color from 'color'
import oco from 'opencolor'
import {createImporter, createExporter} from './factory'

const defaultImporterOptions = {
  selectors: ['class', 'id', 'typeSelector'],
  groupBySelector: true,
  groupAllSelectors: false
}

const defaultExporterOptions = {
  cssvariables: true,
  mapProperties: false,
  propertyMapping: {
    'background-color': (name) => {
      return /(background|bg|fill)/.test(name)
    },
    'color': (name) => {
      return /(color|fg|text|font)/.test(name)
    }
  }
}

const validSelectors = ['class', 'id', 'typeSelector']

export const importer = createImporter(defaultImporterOptions, (input, options) => {
  if (options.selectors && options.selectors.length && options.selectors.some(selector => validSelectors.indexOf(selector) === -1)) {
    return Promise.reject(new Error(`Invalid option scope: ${options.selector.join(', ')} - valid elements are ${validSelectors.join(', ')}`))
  }
  return new Promise((resolve, reject) => {
    var ocoPalette = new oco.Entry()

    var parseTree = gonzales.parse(input)

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
        node.traverseByTypes(['ident', 'color'], (node, index, parent) => {
          if (node.is('ident')) {
            cssProperty = node.content
          }
          if (node.is('color')) {
            var colorValue = Color('#' + node.content)
            var colorEntry = new oco.Entry(cssProperty, [oco.ColorValue.fromColorValue(colorValue.hexString())])
            if (options.groupBySelector) {
              if (options.groupAllSelectors) {
                selectors.forEach((group) => {
                  var path = group.join(' ') + '.' + cssProperty
                  ocoPalette.set(path, colorEntry.clone())
                })
              } else {
                var path = selectors[0].join(' ') + '.' + cssProperty
                ocoPalette.set(path, colorEntry)
              }
            } else {
              ocoPalette.set(cssProperty, colorEntry)
            }
          }
        })
      })
      selectors = []
    })

    resolve(ocoPalette)
  })
})

function getProperty (entryName, options) {
  return Object.keys(options.propertyMapping).find((propertyName) => {
    return options.propertyMapping[propertyName](entryName)
  })
}

export const exporter = createExporter(defaultExporterOptions, (tree, options) => {
  return new Promise((resolve, reject) => {
    let lines = []
    if (options.cssvariables) {
      lines.push(':root {')
      tree.exportEntries((entry) => {
        lines.push(`  --${entry.name}: ${entry.hexcolor()}`)
      })
      lines.push('}')
    }
    if (options.mapProperties) {
      tree.exportEntries((entry) => {
        var propertyName = getProperty(entry.name, options)
        lines.push(`${propertyName}: ${entry.hexcolor()}`)
      })
    }
    resolve(lines.join('\n'))
  })
})

export default {
  exporter: exporter,
  importer: importer
}
