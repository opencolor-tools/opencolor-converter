import {stylsheetImporter} from './stylesheet'
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
  return stylsheetImporter(input, options, 'css')
})

function getPropertyName (entryName, options) {
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
        if (entry.type === 'Color') {
          lines.push(`  --${entry.name}: ${entry.hexcolor()}`)
        }
      })
      lines.push('}')
    }
    if (options.mapProperties) {
      let indent = ''
      let openPalette = null
      tree.exportEntries((entry) => {
        if (indent.length && entry.parent !== openPalette) {
          lines.push('}')
          indent = '  '
          openPalette = null
        }
        if (entry.type === 'Palette') {
          lines.push(`${entry.name} {`)
          indent = '  '
          openPalette = entry
        }
        var propertyName = getPropertyName(entry.name, options)
        if (!propertyName) {
          propertyName = entry.name
        }
        if (entry.type === 'Reference') {
          lines.push(`${indent}${propertyName}: var(${entry.refName})`)
        } else if (openPalette && entry.type === 'Color') {
          lines.push(`${indent}--${propertyName}: ${entry.hexcolor()}`)
        }
      })
      if (openPalette) {
        lines.push('}')
      }
    }
    resolve(lines.join('\n'))
  })
})

export default {
  exporter: exporter,
  importer: importer
}
