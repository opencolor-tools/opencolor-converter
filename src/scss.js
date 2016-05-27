import {stylsheetImporter} from './stylesheet'
import {createImporter, createExporter} from './factory'

const defaultImporterOptions = {
  selectors: ['class', 'id', 'typeSelector'],
  groupBySelector: false,
  useOnlyTheFirstSelector: false
}

const defaultExporterOptions = {
  mapProperties: false,
  propertyMapping: {
    'background-color': (name) => {
      return /(background|bg|fill)/.test(name)
    },
    'color': (name) => {
      return /(color|fg|text|font)/.test(name)
    },
    'border': (name) => {
      return /border.*/.test(name)
    }
  }
}

const validSelectors = ['class', 'id', 'typeSelector']

export const importer = createImporter(defaultImporterOptions, (input, options) => {
  if (options.selectors && options.selectors.length && options.selectors.some(selector => validSelectors.indexOf(selector) === -1)) {
    return Promise.reject(new Error(`Invalid option scope: ${options.selector.join(', ')} - valid elements are ${validSelectors.join(', ')}`))
  }
  return stylsheetImporter(input, options, 'scss')
})

function getPropertyName (entryName, options) {
  if (!options.mapProperties) {
    return entryName
  }
  let propertyName = Object.keys(options.propertyMapping).find((propertyName) => {
    return options.propertyMapping[propertyName](entryName)
  })
  return propertyName || entryName
}

export const exporter = createExporter(defaultExporterOptions, (tree, options) => {
  return new Promise((resolve, reject) => {
    let lines = []
    function renderPalette (palette, level) {
      let indent = Array(level).join('  ')
      palette.forEach((entry) => {
        if (entry.type === 'Palette') {
          lines.push(`${indent}${entry.name} {`)
          renderPalette(entry, level + 1)
          lines.push(`${indent}`)
        } else if (entry.type === 'Color') {
          lines.push(`${indent}$${entry.name}: ${entry.hexcolor()};`)
        } else if (entry.type === 'Reference') {
          var propertyName = getPropertyName(entry.name, options)
          if (!propertyName) {
            propertyName = entry.name
          }
          lines.push(`${indent}${propertyName}: $${entry.refName};`)
        }
      })
    }
    renderPalette(tree, 0)
    resolve(lines.join('\n'))
  })
})

export default {
  exporter: exporter,
  importer: importer
}
