/* global describe, it */

const assert = require('assert')
const fs = require('fs')
const rdf = require('rdf-ext')
const stringToStream = require('string-to-stream')
const testData = require('rdf-test-data')
const N3Parser = require('..')

describe('N3 parser', () => {
  describe('Stream API', function () {
    it('instance .read should be supported', function (done) {
      let parser = new N3Parser()
      let counter = 0

      parser.read(stringToStream('<http://example.org/subject> <http://example.org/predicate> "object".')).on('data', function () {
        counter++
      }).on('end', function () {
        if (counter !== 1) {
          done('no triple streamed')
        } else {
          done()
        }
      }).on('error', function (error) {
        done(error)
      })
    })

    it('static .read should be supported', function (done) {
      let counter = 0

      N3Parser.read(stringToStream('<http://example.org/subject> <http://example.org/predicate> "object".')).on('data', function () {
        counter++
      }).on('end', function () {
        if (counter !== 1) {
          done('no triple streamed')
        } else {
          done()
        }
      }).on('error', function (error) {
        done(error)
      })
    })
  })

  describe('example data', () => {
    it('card.ttl should be parsed', () => {
      let parser = new N3Parser({baseIRI: 'https://www.example.com/john/card'})

      return testData.stream('text/turtle', 'card').then((stream) => {
        return rdf.dataset().import(parser.read(stream)).then((parsed) => {
          assert(testData.card.equals(parsed))
        })
      })
    })

    it('list.ttl should be parsed', () => {
      let parser = new N3Parser({baseIRI: 'https://www.example.com/list'})

      return testData.stream('text/turtle', 'list').then((stream) => {
        return rdf.dataset().import(parser.read(stream)).then(function (dataset) {
          assert(testData.list.equals(dataset))
        })
      })
    })
  })
})
