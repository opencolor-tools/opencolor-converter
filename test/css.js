/* eslint-env mocha */
import {expect} from 'chai'
import oco from 'opencolor'
import {importer, exporter} from '../src/css'

describe('CSS Converter', () => {
  describe('Importer', () => {
    it('should import one color per ruleset', () => {
      return importer(`body {
  background-color: #F00
      }`).then((tree) => {
        expect(tree.get('body.background-color').hexcolor()).to.equal('#FF0000')
      })
    })
    it('should import border colors', () => {
      return importer(`body {
  border-color: #111111;
  border-color-bottom: #222222;
  border: 1px solid #333333;
      }`).then((tree) => {
        expect(tree.get('body.border-color').hexcolor()).to.equal('#111111')
        expect(tree.get('body.border-color-bottom').hexcolor()).to.equal('#222222')
        expect(tree.get('body.border').hexcolor()).to.equal('#333333')
      })
    })
    it('should import more than one color per ruleset', () => {
      return importer(`body {
  background-color: #F00;
  color: #F00
      }`).then((tree) => {
        expect(tree.get('body.background-color').hexcolor()).to.equal('#FF0000')
        expect(tree.get('body.color').hexcolor()).to.equal('#FF0000')
      })
    })
    it('should import more than one rulesets', () => {
      return importer(`body {
  color: #F00
      }
  h1 {
    color: #000000
      }`).then((tree) => {
        expect(tree.get('body.color').hexcolor()).to.equal('#FF0000')
        expect(tree.get('h1.color').hexcolor()).to.equal('#000000')
      })
    })
  })
  describe('Exporter', () => {
    it('should export', () => {
      const tree = oco.parse(`
one: #111111
`)
      return exporter(tree).then((scss) => {
        expect(scss).to.contain('--one: #111111')
      })
    })
    it('should export all entrys in root as vars', () => {
      const tree = oco.parse(`
one: #111111
color: =one
`)
      return exporter.configure()(tree).then((scss) => {
        expect(scss).to.contain('--one: #111111')
        expect(scss).to.contain('--color: var(one)')
      })
    })
    it('should export groups (only turn names that are not a color attribute into vars)', () => {
      const tree = oco.parse(`
one: #111111
h1:
  two: #FF0000
  three: =one
  fill: =one
  color: #FF0000
`)
      return exporter.configure({})(tree).then((scss) => {
        expect(scss).to.contain('--one: #111111')
        expect(scss).to.contain('h1 {')
        expect(scss).to.contain('-two: #FF0000')
        expect(scss).to.contain('--three: var(one)')
        expect(scss).to.contain('background-color: var(one)')
        expect(scss).to.not.contain('--background-color: var(one)')
        expect(scss).to.contain('color: #FF0000')
        expect(scss).to.not.contain('--color: #FF0000')
        expect(scss).to.contain('}')
      })
    })
    it('should export groups (with turn all into vars options)', () => {
      const tree = oco.parse(`
one: #111111
h1:
  two: #FF0000
  background-color: =one
`)
      return exporter.configure({allAsVars: true})(tree).then((scss) => {
        expect(scss).to.contain('--one: #111111')
        expect(scss).to.contain('h1 {')
        expect(scss).to.contain('--two: #FF0000')
        expect(scss).to.contain('--background-color: var(one)')
        expect(scss).to.contain('}')
      })
    })
    it('should export references', () => {
      const tree = oco.parse(`
one: #111111
two: =one
`)
      return exporter.configure({allAsVars: true})(tree).then((scss) => {
        expect(scss).to.contain('--one: #111111')
        expect(scss).to.contain('--two: var(one)')
      })
    })
    it('should change names based on mapping', () => {
      const tree = oco.parse(`
h1:
  fill: #FF0000
`)
      return exporter.configure()(tree).then((scss) => {
        expect(scss).to.contain('h1 {')
        expect(scss).to.contain('background-color: #FF0000')
      })
    })
  })
})
