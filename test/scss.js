/* eslint-env mocha */
import {expect} from 'chai'
import oco from 'opencolor'
import {importer, exporter} from '../src/scss'

describe('SCSS Converter', () => {
  describe('Importer', () => {
    it('should import one variable', () => {
      return importer(`
$one: #111111
      `).then((tree) => {
        expect(tree.get('one').hexcolor()).to.equal('#111111')
      })
    })
    it('should create references for variable assignments', () => {
      return importer(`
$one: #111111;
$onRef: $one
      `).then((tree) => {
        expect(tree.get('one').hexcolor()).to.equal('#111111')
        expect(tree.get('onRef').type).to.equal('Reference')
        expect(tree.get('onRef').resolved().type).to.equal('Color')
        expect(tree.get('onRef').resolved().hexcolor()).to.equal('#111111')
      })
    })
    it('should create references for variable assignments in rulesets', () => {
      return importer(`
$one: #111111;
body {
  color: $one
}
      `).then((tree) => {
        expect(tree.get('one').hexcolor()).to.equal('#111111')
        expect(tree.get('body.color').type).to.equal('Reference')
        expect(tree.get('body.color').resolved().type).to.equal('Color')
        expect(tree.get('body.color').resolved().hexcolor()).to.equal('#111111')
      })
    })
    it('should import multiple variables', () => {
      return importer(`
$one: #111111;
$two: #222222;
      `).then((tree) => {
        expect(tree.get('one').hexcolor()).to.equal('#111111')
        expect(tree.get('two').hexcolor()).to.equal('#222222')
      })
    })
    it('should import variables inside selectors', () => {
      return importer(`
body {
  $one: #111111;
  $two: #222222;
}
      `).then((tree) => {
        expect(tree.get('body.one').hexcolor()).to.equal('#111111')
        expect(tree.get('body.two').hexcolor()).to.equal('#222222')
      })
    })
  })
  describe('Exporter', () => {
    it('should export', () => {
      const tree = oco.parse(`
one: #111111
`)
      return exporter(tree).then((scss) => {
        expect(scss).to.contain('$one: #111111')
      })
    })
    it('should export all entrys in root as vars', () => {
      const tree = oco.parse(`
one: #111111
color: =one
`)
      return exporter.configure()(tree).then((scss) => {
        expect(scss).to.contain('$one: #111111')
        expect(scss).to.contain('$color: $one')
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
        expect(scss).to.contain('$one: #111111')
        expect(scss).to.contain('h1 {')
        expect(scss).to.contain('$two: #FF0000')
        expect(scss).to.contain('$three: $one')
        expect(scss).to.contain('background-color: $one')
        expect(scss).to.not.contain('$background-color: $one')
        expect(scss).to.contain('color: #FF0000')
        expect(scss).to.not.contain('$color: #FF0000')
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
        expect(scss).to.contain('$one: #111111')
        expect(scss).to.contain('h1 {')
        expect(scss).to.contain('$two: #FF0000')
        expect(scss).to.contain('$background-color: $one')
        expect(scss).to.contain('}')
      })
    })
    it('should export references', () => {
      const tree = oco.parse(`
one: #111111
two: =one
`)
      return exporter.configure({allAsVars: true})(tree).then((scss) => {
        expect(scss).to.contain('$one: #111111')
        expect(scss).to.contain('$two: $one')
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
