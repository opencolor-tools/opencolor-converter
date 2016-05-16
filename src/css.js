import gonzales from 'gonzales-pe'
import Color from 'color'
import oco from 'opencolor'
import {createConverter} from './factory'

const defaultOptions = {
  selectors: ['class', 'id', 'typeSelector'],
  groupBySelector: true,
  groupAllSelectors: false
}

const validSelectors = ['class', 'id', 'typeSelector']

export const importer = createConverter(defaultOptions, (input, options) => {
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
          console.log(node)
          if (node.is('ident')) {
            cssProperty = node.content
          }
          if (node.is('color')) {
            console.log(selectors, cssProperty)
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
                console.log(path)
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
