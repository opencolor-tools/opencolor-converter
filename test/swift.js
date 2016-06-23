/* eslint-env mocha */
import {expect} from 'chai'
import {parse} from 'opencolor'
import {exporter} from '../src/swift'

describe('Swift Converter', () => {
  describe('Exporter', () => {
    it('should export', () => {
      const tree = parse(`
one: #FFFFFF
`)
      return exporter(tree).then((scss) => {
        expect(scss).to.contain('let oneColor = UIColor(red: 1, green: 1, blue: 1, alpha: 1)')
      })
    })
    it('should export references', () => {
      const tree = parse(`
one: #FFFFFF
two: =one
`)
      return exporter.configure({allAsVars: true})(tree).then((scss) => {
        expect(scss).to.contain('let oneColor = UIColor(red: 1, green: 1, blue: 1, alpha: 1)')
        expect(scss).to.contain('let twoColor = oneColor')
      })
    })
  })
})
