/*

FORMAT EXAMPLE:

{
  "metadata": {
    "oct": {
      "defaultView": "grid"
    }
  },
  "colorGroups": [
    {
      "name": "grey",
      "metadata": {
        "namespace": {
          "priority": 0
        }
      },
      "shades": {
        "10": "#FBFBFB"
      }
    }
  ]
}

*/

import {
  createImporter, createExporter
}
from './factory'
import {
  Entry, ColorValue
}
from 'opencolor'
import Color from 'color'

const defaultImporterOptions = {
}

const defaultExporterOptions = {
  exportMetadata: true
}

export const importer = createImporter(defaultImporterOptions, (input, options) => {
  throw new Error('JSON import not supported')
})

export const exporter = createExporter(defaultExporterOptions, (tree,
  options) => {
  function processMetadata (entry) {
    if (!options.exportMetadata) return null

    let metadata = {}

    entry.metadata.keys().forEach(key => {
      let context = key.split('/')[0]
      let attribute = key.split('/')[1]
      if (!metadata[context]) metadata[context] = {}
      let value = entry.metadata.get(key)
      if (value.type === 'Reference') value = '=' + value.refName
      metadata[context][attribute] = value
    })

    return metadata
  }

  return new Promise((resolve, reject) => {
    let out = {
      metadata: processMetadata(tree),
      colorGroups: []
    }
    if (!options.exportMetadata) delete out.metadata

    let currentPalette = null
    tree.exportEntries(entry => {
      if (entry.type === 'Palette') {
        currentPalette = {
          name: entry.name,
          metadata: processMetadata(entry),
          shades: {}
        }
        if (!options.exportMetadata) delete currentPalette.metadata
        out.colorGroups.push(currentPalette)
      } else if (entry.type === 'Color') {
        currentPalette.shades[entry.name] = entry.hexcolor()
      } else if (entry.type === 'Reference') {
        currentPalette.shades[entry.name] = '=' + entry.refName
      }
    })

    resolve(JSON.stringify(out, null, '  '))
  })
})

export default {
  exporter: exporter,
  importer: importer
}
