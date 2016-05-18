import {stylsheetImporter} from './stylesheet'
import {createImporter, createExporter} from './factory'

const defaultImporterOptions = {
  selectors: ['class', 'id', 'typeSelector'],
  groupBySelector: true,
  groupAllSelectors: false
}

const defaultExporterOptions = {
  variables: true,
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
  return stylsheetImporter(input, options, 'less')
})

function getPropertyName (entryName, options) {
  return Object.keys(options.propertyMapping).find((propertyName) => {
    return options.propertyMapping[propertyName](entryName)
  })
}

export const exporter = createExporter(defaultExporterOptions, (tree, options) => {
  return new Promise((resolve, reject) => {
    let lines = []
    if (options.variables) {
      tree.exportEntries((entry) => {
        lines.push(`@${entry.name}: ${entry.hexcolor()};`)
      })
    }
    if (options.mapProperties) {
      tree.exportEntries((entry) => {
        var propertyName = getPropertyName(entry.name, options)
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
