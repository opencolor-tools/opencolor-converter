import {createImporter, createExporter} from './factory'
import Color from 'color'

const defaultExporterOptions = {
}

export const importer = createImporter({}, (input, options) => {
  throw new Error('swift import not supported')
})

export const exporter = createExporter(defaultExporterOptions, (tree, options) => {
  return new Promise((resolve, reject) => {
    let lines = []
    function renderPalette (palette, level) {
      palette.forEach((entry) => {
        if (entry.type === 'Palette') {
          renderPalette(entry, level + 1)
        } else if (entry.type === 'Color') {
          var entryColor = Color(entry.hexcolor())

          lines.push(`let ${entry.name}Color = UIColor(red: ${entryColor.red() / 255}, green: ${entryColor.green() / 255}, blue: ${entryColor.blue() / 255}, alpha: 1)`)
        } else if (entry.type === 'Reference') {
          lines.push(`let ${entry.name}Color = ${entry.refName}Color;`)
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
