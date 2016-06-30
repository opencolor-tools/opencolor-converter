import {stylsheetImporter} from './stylesheet'
import {createImporter, createExporter} from './factory'

const defaultImporterOptions = {
  selectors: ['class', 'id', 'typeSelector'],
  groupBySelector: true,
  useOnlyTheFirstSelector: false
}

const defaultExporterOptions = {
  mapProperties: true,
  allAsVars: false,
  propertyMapping: {
    'background-color': (name) => {
      return /(background|bg|fill)/.test(name)
    },
    'color': (name) => {
      return /(color|fg|text|font|text-color)/.test(name)
    },
    'border-color': (name) => {
      return /(border|stroke|border-color|stroke-color).*/.test(name)
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
  if (!options.mapProperties) {
    return entryName
  }
  let propertyName = ''
  Object.keys(options.propertyMapping).forEach((prop) => {
    if (options.propertyMapping[prop](entryName) && !propertyName) {
      propertyName = prop
    }
  })
  return propertyName || entryName
}

function isColorProperty (entryName, options) {
  for (var colorProperty in options.propertyMapping) {
    if (colorProperty === entryName) { return true }
  }
  return false
}

export const exporter = createExporter(defaultExporterOptions, (tree, options) => {
  return new Promise((resolve, reject) => {
    let lines = []
    function renderPalette (palette, level) {
      let indent = Array(level + 1).join('  ')

      palette.forEach((entry) => {
        if (entry.type === 'Palette') {
          lines.push(`${indent}${entry.name} {`)
          renderPalette(entry, level + 1)
          lines.push(`${indent}}`)
        } else if (entry.type === 'Color') {
          var propertyName = getPropertyName(entry.name, options)

          if (options.allAsVars || level === 0 || !isColorProperty(propertyName, options)) {
            lines.push(`${indent}--${propertyName}: ${entry.hexcolor()};`)
          } else {
            lines.push(`${indent}${propertyName}: ${entry.hexcolor()};`)
          }
        } else if (entry.type === 'Reference') {
          propertyName = getPropertyName(entry.name, options)

          if (options.allAsVars || level === 0 || !isColorProperty(propertyName, options)) {
            lines.push(`${indent}--${propertyName}: var(${entry.refName});`)
          } else {
            lines.push(`${indent}${propertyName}: var(${entry.refName});`)
          }
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
