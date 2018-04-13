const rdf = require('rdf-data-model')
const Readable = require('readable-stream')
const N3 = require('n3')

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

    const parser = new N3.Parser({baseIRI, factory})

    parser.parse(input, (err, quad) => {
      if (err) {
        return this.emit('error', err)
      }
      this.push(quad || null)
    })
  }

  _read () {
  }
}

module.exports = ParserStream
