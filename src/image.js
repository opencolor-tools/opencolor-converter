import {createImporter, createExporter} from './factory'
import oco from 'opencolor'
import Color from 'color'
import Vibrant from 'node-vibrant'
import getColors from 'get-image-colors'
import fileType from 'file-type'

const defaultImporterOptions = {
  importer: 'basic',
  colors: 8
}

export const importer = createImporter(defaultImporterOptions, (input, options) => {
  if (options.importer === 'vibrant') {
    return new Promise((resolve, reject) => {
      Vibrant.from(input).getPalette(function (err, palette) {
        if (err) {
          Promise.reject(err)
        }

        let paletteJson = {}

        for (var key in palette) {
          if (palette[key] !== null) {
            paletteJson[key] = palette[key].getHex()
          }
        }

        paletteJson = JSON.stringify(paletteJson)

        var tree = null

        try {
          tree = JSON.parse(paletteJson)
        } catch (e) {
          Promise.reject(e)
        }

        var ocoPalette = new oco.Entry()

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
              const color = new oco.Entry(name, [oco.ColorValue.fromColorValue(colorValue.hexString())])
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
  } else {
    return new Promise((resolve, reject) => {
      let mimeType = fileType(input).mime

      getColors(input, mimeType, options.colors, function (err, palette) {
        if (err) {
          Promise.reject(err)
        }

        let paletteJson = {}

        for (var i = 0; i < palette.length; i++) {
          paletteJson['Color ' + (i + 1)] = palette[i].hex()
        }

        paletteJson = JSON.stringify(paletteJson)

        var tree = null

        try {
          tree = JSON.parse(paletteJson)
        } catch (e) {
          Promise.reject(e)
        }

        var ocoPalette = new oco.Entry()

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
              const color = new oco.Entry(name, [oco.ColorValue.fromColorValue(colorValue.hexString())])
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
  }
})

export const exporter = createExporter({}, (tree, options) => {
  throw new Error('image export not supported')
})

export default {
  exporter: exporter,
  importer: importer
}
