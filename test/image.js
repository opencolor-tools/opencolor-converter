/* eslint-env mocha */
import {expect} from 'chai'
import {importer} from '../src/image'
import * as fs from 'fs'
import * as path from 'path'

describe.only('Image Converter', () => {
  describe('Importer', () => {
    const png = fs.readFileSync(path.join(__dirname, 'fixtures', 'image.png'))
    it('should import png', () => {
      return importer(png).then((tree) => {
        expect(tree.children.length).to.be.greaterThan(1)
        expect(tree.get('Vibrant')).to.not.be.undefined
        expect(tree.get('Muted')).to.not.be.undefined
        expect(tree.get('Vibrant').hexcolor()).to.equal('#232E90')
      })
    })
  })
})
