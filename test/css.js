import {expect} from 'chai'
import {importer} from '../src/css'

describe.only('CSS Converter', () => {
  it('should import one color per ruleset', () => {
    return importer(`body {
background-color: #F00
    }`).then((tree) => {
      expect(tree.get('body.background-color').hexcolor()).to.equal('#FF0000')
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
