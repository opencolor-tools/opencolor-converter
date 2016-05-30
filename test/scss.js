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
color: #111111
`)
      return exporter(tree).then((scss) => {
        expect(scss).to.contain('$color: #111111')
      })
    })
    it('should export refrences', () => {
      const tree = oco.parse(`
one: #111111
refToOne: =one
`)
      return exporter.configure({})(tree).then((scss) => {
        expect(scss).to.contain('$one: #111111')
        expect(scss).to.contain('$refToOne: $one')
      })
    })
    it('should export groups', () => {
      const tree = oco.parse(`
h1:
  one: #111111
  refToOne: =one
`)
      return exporter.configure({})(tree).then((scss) => {
        expect(scss).to.contain('h1 {')
        expect(scss).to.contain('$one: #111111')
        expect(scss).to.contain('$refToOne: $one')
      })
    })
    it('should change names based on mapping', () => {
      const tree = oco.parse(`
h1:
  one: #111111
  fill: =one
`)
      return exporter.configure({mapProperties: true})(tree).then((scss) => {
        expect(scss).to.contain('h1 {')
        expect(scss).to.contain('$one: #111111')
        expect(scss).to.contain('background-color: $one')
      })
    })
  })
})
