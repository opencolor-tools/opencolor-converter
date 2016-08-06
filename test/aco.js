/* eslint-env mocha */
import {expect} from 'chai'
import {importer} from '../src/aco'
import * as fs from 'fs'
import * as path from 'path'

describe('ACO Converter', () => {
  describe('Importer', () => {
    const aco = fs.readFileSync(path.join(__dirname, 'fixtures', 'Material Palette.aco'))
    it('should import one variable', () => {
      return importer(aco).then((tree) => {
        expect(tree.children.length).to.be.greaterThan(1)
        expect(tree.get('Red 100')).to.not.be.undefined
        expect(tree.get('Blue 100')).to.not.be.undefined
      })
    })
    const aco2 = fs.readFileSync(path.join(__dirname, 'fixtures', 'namics15_colors.aco'))
    it('should import the right colors', () => {
      return importer(aco2).then((tree) => {
        expect(tree.children.length).to.be.greaterThan(1)
        expect(tree.get('DigitalCommunications_yellow').hexcolor()).to.equal('#FBE937')
      })
    })
  })
})
