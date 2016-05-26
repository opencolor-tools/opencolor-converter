/* eslint-env mocha */
import {expect} from 'chai'
import * as converter from '../lib'

describe('Converter API', () => {
  it('should convert less', () => {
    expect(converter).to.have.ownProperty('less')
  })
  it('should convert aco', () => {
    expect(converter).to.have.ownProperty('aco')
  })
  it('should convert css', () => {
    expect(converter).to.have.ownProperty('css')
  })
  it('should convert scss', () => {
    expect(converter).to.have.ownProperty('scss')
  })
  it('should convert json', () => {
    expect(converter).to.have.ownProperty('json')
  })
  it('all converter should be provide import and export', () => {
    Object.keys(converter).forEach((key) => {
      expect(converter[key]).to.respondTo('importer')
      expect(converter[key]).to.respondTo('exporter')
    })
  })
  it('all importer and exporter should be configurable', () => {
    Object.keys(converter).forEach((key) => {
      expect(converter[key]['importer']).to.have.ownProperty('configure')
      expect(converter[key]['exporter']).to.have.ownProperty('configure')
    })
  })
})
