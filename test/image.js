/* eslint-env mocha */
import {expect} from 'chai'
import {importer} from '../src/image'
import * as fs from 'fs'
import * as path from 'path'

describe('Image Converter', () => {
  describe('Importer', () => {
    const png = fs.readFileSync(path.join(__dirname, 'fixtures', 'image.png'))
    it('should import png', () => {
      return importer(png).then((tree) => {
        expect(tree.children.length).to.be.greaterThan(1)
        expect(tree.get('Color0')).to.not.be.undefined
      })
    })
    const jpg = fs.readFileSync(path.join(__dirname, 'fixtures', 'image.jpg'))
    it('should import jpg', () => {
      return importer(jpg).then((tree) => {
        expect(tree.children.length).to.be.greaterThan(1)
        expect(tree.get('Color0')).to.not.be.undefined
      })
    })
    it('should import png using Vibrant', () => {
      return importer(png, {importer: 'vibrant'}).then((tree) => {
        expect(tree.children.length).to.be.greaterThan(1)
        expect(tree.get('Vibrant')).to.not.be.undefined
        expect(tree.get('Muted')).to.not.be.undefined
        expect(tree.get('Vibrant').hexcolor()).to.equal('#232E90')
      })
    })
    const png2 = fs.readFileSync(path.join(__dirname, 'fixtures', 'image2.png'))
    it('should import png using Vibrant, even when there are not all swatches', () => {
      return importer(png2, {importer: 'vibrant'}).then((tree) => {
        expect(tree.children.length).to.be.greaterThan(1)
        expect(tree.get('Vibrant')).to.not.be.undefined
        expect(tree.get('DarkMuted')).to.be.undefined
      })
    })
  })
})
