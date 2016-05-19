import {createImporter, createExporter} from './factory'
import oco from 'opencolor'
import Color from 'color'

const defaultImporterOptions = {
}

const defaultExporterOptions = {

}

export const importer = createImporter(defaultImporterOptions, (input, options) => {
  var tree = null
  try {
    tree = JSON.parse(input)
  } catch (e) {
    Promise.reject(e)
  }
  return new Promise((resolve, reject) => {
    var ocoPalette = new oco.Entry()

    function walk (key, value, path, level) {
      path = path.slice(0)
      if (Object.prototype.toString.call(value) === '[object Array]') {
        path.push(key)
        value.forEach((item, index) => {
          walk(index, item, path, level + 1)
        })
      } else if (typeof value === 'object') {
        path.push(key)
        Object.keys(value).forEach((k) => {
          walk(k, value[k], path, level + 1)
        })
      } else {
        var colorValue = null
        try {
          colorValue = Color(value)
        } catch (e) {}
        if (colorValue) {
          const color = new oco.Entry(key, [oco.ColorValue.fromColorValue(colorValue.hexString())])
          path.push(key)
          ocoPalette.set(path.join('.'), color)
        }
      }
    }
    Object.keys(tree).forEach((k) => {
      walk(k, tree[k], [], 0)
    })

    resolve(ocoPalette)
  })
})

export const exporter = createExporter(defaultExporterOptions, (tree, options) => {
  return new Promise((resolve, reject) => {
    let out = {}
    let current = out
    let currentPalette = null
    tree.exportEntries((entry) => {
      if (entry.type === 'Palette') {
        // only works for nesting depth of 1
        if (currentPalette === entry.parent) {
          current[entry.name] = {}
          current = current[entry.name]
        } else {
          out[entry.name] = {}
          current = out[entry.name]
        }
      } else if (entry.type === 'Color') {
        current[entry.name] = entry.hexcolor()
      } else if (entry.type === 'Reference') {
        current[entry.name] = '=' + entry.refName
      }
    })
    resolve(JSON.stringify(out, null, '  '))
  })
})

export default {
  exporter: exporter,
  importer: importer
}
