import rdf from '@rdfjs/data-model'
import toReadable from 'duplex-to/readable.js'
import { StreamParser } from 'n3'

class ParserStream {
  constructor (input, { baseIRI = '', factory = rdf } = {}) {
    const boundFactory = {
      blankNode: factory.blankNode.bind(factory),
      defaultGraph: factory.defaultGraph.bind(factory),
      literal: factory.literal.bind(factory),
      namedNode: factory.namedNode.bind(factory),
      quad: factory.quad.bind(factory)
    }

    const parser = new StreamParser({ baseIRI, factory: boundFactory })

    input.pipe(parser)

    return toReadable(parser)
  }
}

export default ParserStream
