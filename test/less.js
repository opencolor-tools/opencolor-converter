/* eslint-env mocha */
import {expect} from 'chai'
import oco from 'opencolor'
import {importer, exporter} from '../src/less'

describe('Less Converter', () => {
  describe('Importer', () => {
    it('should import one variable', () => {
      return importer(`
@one: #111111
      `).then((tree) => {
        expect(tree.get('one').hexcolor()).to.equal('#111111')
      })
    })
    it('should create references for variable assignments', () => {
      return importer(`
@one: #111111;
color: @one
      `).then((tree) => {
        expect(tree.get('one').hexcolor()).to.equal('#111111')
        expect(tree.get('color').type).to.equal('Reference')
        expect(tree.get('color').resolved().type).to.equal('Color')
        expect(tree.get('color').resolved().hexcolor()).to.equal('#111111')
      })
    })
    it('should create references for variable assignments in rulesets', () => {
      return importer(`
@one: #111111;
body {
  color: @one
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
@one: #111111;
@two: #222222;
      `).then((tree) => {
        expect(tree.get('one').hexcolor()).to.equal('#111111')
        expect(tree.get('two').hexcolor()).to.equal('#222222')
      })
    })
    it('should import variables inside selectors', () => {
      return importer(`
body {
  @one: #111111;
  @two: #222222;
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
      return exporter(tree).then((css) => {
        expect(css).to.contain('@color: #111111')
      })
    })
    it('should map properties', () => {
      const tree = oco.parse(`
text: #111111
bg: #222222
fg: #333333
fill: #444444
`)
      return exporter(tree, {cssvariables: false, mapProperties: true})
        .then((css) => {
          expect(css).to.contain('color: #111111')
          expect(css).to.contain('color: #333333')
          expect(css).to.contain('background-color: #222222')
          expect(css).to.contain('background-color: #444444')
        })
    })
  })
})
