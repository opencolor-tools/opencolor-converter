/* eslint-env mocha */
import {expect} from 'chai'
import oco from 'opencolor'
import {importer, exporter} from '../src/json'

describe('JSON Converter', () => {
  describe('Importer', () => {
    it('should import one variable', () => {
      return importer(`
{
  "one": "#111111"
}
      `).then((tree) => {
        expect(tree.get('one').hexcolor()).to.equal('#111111')
      })
    })
    it('should ignore none color values', () => {
      return importer(`
{
  "xxx": "#helloworld"
}
      `).then((tree) => {
        expect(tree.children.length).to.equal(0)
      })
    })
    it('should import more than one color value', () => {
      return importer(`
{
  "one": "#111111",
  "two": "#222222"
}
      `).then((tree) => {
        expect(tree.get('one').hexcolor()).to.equal('#111111')
        expect(tree.get('two').hexcolor()).to.equal('#222222')
      })
    })
    it('should import colors in arrays', () => {
      return importer(`
{
  "data": ["#111111", "#222222", "#333333"]
}
`     ).then((tree) => {
        expect(tree.get('data.0').hexcolor()).to.equal('#111111')
        expect(tree.get('data.1').hexcolor()).to.equal('#222222')
      })
    })
  })
  describe('Exporter', () => {
    it('should export', () => {
      const tree = oco.parse(`
color: #111111
`)
      return exporter(tree).then((json) => {
        expect(json).to.contain('"color": "#111111"')
      })
    })
    it('should export sub palettes', () => {
      const tree = oco.parse(`
group:
  one: #111111
othergroup:
  two: #222222
`)
      return exporter(tree).then((json) => {
        expect(json).to.contain('"one": "#111111"')
        expect(json).to.contain('"two": "#222222"')
      })
    })
    it('should export references', () => {
      const tree = oco.parse(`
group:
  one: #111111
othergroup:
  two: =group.one
`)
      return exporter(tree).then((json) => {
        expect(json).to.contain('"one": "#111111"')
        expect(json).to.contain('"two": "=group.one"')
      })
    })
  })
})
