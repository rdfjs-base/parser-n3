const rdf = require('rdf-data-model')
const Readable = require('readable-stream')
const N3 = require('n3')

function term (factory, rawNode) {
  if (rawNode.termType === 'NamedNode') {
    return factory.namedNode(rawNode.value)
  } else if (rawNode.termType === 'BlankNode') {
    return factory.blankNode(rawNode.value)
  } else if (rawNode.termType === 'Literal') {
    return factory.literal(rawNode.value, rawNode.language || rawNode.datatype)
  } else if (rawNode.termType === 'DefaultGraph') {
    return factory.defaultGraph()
  }
}

class ParserStream extends Readable {
  constructor (input, options) {
    super({
      objectMode: true
    })

    options = options || {}

    if (!('importPrefixMap' in options)) {
      options.importPrefixMap = true
    }

    const baseIRI = options.baseIRI || ''
    const factory = options.factory || rdf

    input.on('error', (err) => {
      this.emit('error', err)
    })

    const parser = new N3.Parser({documentIRI: baseIRI})

    parser.parse(input, (err, rawQuad, rawPrefixes) => {
      if (err) {
        return this.emit('error', err)
      }

      if (!rawQuad) {
        return this.push(null)
      }

      this.push(factory.quad(
        term(factory, rawQuad.subject),
        term(factory, rawQuad.predicate),
        term(factory, rawQuad.object),
        term(factory, rawQuad.graph)
      ))
    })
  }

  _read () {
  }
}

module.exports = ParserStream
