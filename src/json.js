import {createImporter, createExporter} from './factory'
import {Entry, ColorValue} from 'opencolor'
import Color from 'color'

const defaultImporterOptions = {
  readNameFromKey: false,
  keyForName: 'name'
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
    var ocoPalette = new Entry()

    function walk (key, value, path, parent, level) {
      path = path.slice(0)
      if (Object.prototype.toString.call(value) === '[object Array]') {
        path.push(key)
        value.forEach((item, index) => {
          walk(index, item, path, value, level + 1)
        })
      } else if (typeof value === 'object') {
        path.push(key)
        Object.keys(value).forEach((k) => {
          walk(k, value[k], path, value, level + 1)
        })
      } else {
        var colorValue = null
        try {
          colorValue = Color(value)
        } catch (e) {}
        if (colorValue) {
          var name = key
          if (options.readNameFromKey && typeof parent === 'object' && options.keyForName in parent) {
            name = parent[options.keyForName]
          }
          const color = new Entry(name, [ColorValue.fromColorValue(colorValue.hexString())])
          path.push(name)
          ocoPalette.set(path.join('.'), color)
        }
      }
    }
    Object.keys(tree).forEach((k) => {
      walk(k, tree[k], [], tree, 0)
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
