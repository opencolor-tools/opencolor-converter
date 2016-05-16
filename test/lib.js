/* eslint-env mocha */
import {expect} from 'chai'
import * as converter from '../lib'

describe('Converter API', () => {
  it('should convert less', () => {
    expect(converter).to.have.ownProperty('less')
  })
  it('should respond to flatten', () => {
    expect(converter).to.have.ownProperty('aco')
  })
  it('should respond to searchAndReplace', () => {
    expect(converter).to.have.ownProperty('css')
  })
  it('should respond to autoname', () => {
    expect(converter).to.have.ownProperty('sass')
  })
  it('all comverter should be configurable', () => {
    Object.keys(converter).forEach((key) => {
      expect(converter[key]).to.respondTo('importer')
      expect(converter[key]).to.respondTo('exporter')
    })
  })
})
