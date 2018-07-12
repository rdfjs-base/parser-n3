/* global describe, it */

const assert = require('assert')
const sinkTest = require('@rdfjs/sink/test')
const stringToStream = require('string-to-stream')
const N3Parser = require('..')

function waitFor (stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

describe('@rdfjs/parser-n3', () => {
  sinkTest(N3Parser, {readable: true})

  it('.import should parse the given string triple stream', () => {
    const nt = '<http://example.org/subject> <http://example.org/predicate> "object" .'
    const parser = new N3Parser()

    const stream = parser.import(stringToStream(nt))

    return Promise.resolve().then(() => {
      const quad = stream.read()

      assert.equal(quad.subject.termType, 'NamedNode')
      assert.equal(quad.subject.value, 'http://example.org/subject')

      assert.equal(quad.predicate.termType, 'NamedNode')
      assert.equal(quad.predicate.value, 'http://example.org/predicate')

      assert.equal(quad.object.termType, 'Literal')
      assert.equal(quad.object.value, 'object')

      assert.equal(quad.graph.termType, 'DefaultGraph')

      return waitFor(stream)
    })
  })

  it('.import should parse the given string quad stream', () => {
    const nt = '<http://example.org/subject> <http://example.org/predicate> "object" <http://example.org/graph> .'
    const parser = new N3Parser()

    const stream = parser.import(stringToStream(nt))

    return Promise.resolve().then(() => {
      const quad = stream.read()

      assert.equal(quad.subject.termType, 'NamedNode')
      assert.equal(quad.subject.value, 'http://example.org/subject')

      assert.equal(quad.predicate.termType, 'NamedNode')
      assert.equal(quad.predicate.value, 'http://example.org/predicate')

      assert.equal(quad.object.termType, 'Literal')
      assert.equal(quad.object.value, 'object')

      assert.equal(quad.graph.termType, 'NamedNode')
      assert.equal(quad.graph.value, 'http://example.org/graph')

      return waitFor(stream)
    })
  })

  it('.import should emit prefix events for each prefix', () => {
    const prefix1 = 'http://example.org/prefix1#'
    const prefix2 = 'http://example.org/prefix2#'

    const nt = `PREFIX p1: <${prefix1}>
      PREFIX p2: <${prefix2}>
      <http://example.org/subject> <http://example.org/predicate> "object" .`
    const parser = new N3Parser()
    const prefixes = {}

    const stream = parser.import(stringToStream(nt))

    stream.on('prefix', (prefix, namespace) => {
      prefixes[prefix] = namespace
    })

    stream.resume()

    return waitFor(stream).then(() => {
      assert(prefixes.p1)
      assert.equal(prefixes.p1.termType, 'NamedNode')
      assert.equal(prefixes.p1.value, prefix1)

      assert(prefixes.p2)
      assert.equal(prefixes.p2.termType, 'NamedNode')
      assert.equal(prefixes.p2.value, prefix2)
    })
  })

  it('.import should handle parser errors', () => {
    const nt = '1'
    const parser = new N3Parser()

    const stream = parser.import(stringToStream(nt))

    return new Promise((resolve, reject) => {
      return waitFor(stream).catch(resolve).then(reject)
    })
  })
})
