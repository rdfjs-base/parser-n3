var rdf = require('rdf-ext')
var util = require('util')
var AbstractParser = require('rdf-parser-abstract')
var N3 = require('n3')

function N3Parser (options) {
  AbstractParser.call(this, rdf)

  this.options = options || {}

  if (!('importPrefixMap' in this.options)) {
    this.options.importPrefixMap = true
  }
}

util.inherits(N3Parser, AbstractParser)

N3Parser.prototype.process = function (data, callback, base, filter, done) {
  var self = this

  return new Promise(function (resolve, reject) {
    filter = filter || function () { return true }

    var parser = N3.Parser({documentIRI: base})
    var blankNodes = {}

    parser.parse(data, function (error, n3Triple, n3Prefixes) {
      if (error) {
        if (done) {
          done(error)
        }

        return reject(error)
      }

      if (self.options.importPrefixMap && n3Prefixes) {
        for (var prefix in n3Prefixes) {
          self.rdf.prefixes[prefix] = n3Prefixes[prefix]
        }
      }

      if (!n3Triple) {
        if (done) {
          done()
        }

        return resolve()
      }

      var toRdfNode = function (n3Node) {
        if (N3.Util.isIRI(n3Node)) {
          return self.rdf.createNamedNode(n3Node)
        } else if (N3.Util.isBlank(n3Node)) {
          if (n3Node in blankNodes) {
            return blankNodes[n3Node]
          } else {
            return (blankNodes[n3Node] = self.rdf.createBlankNode())
          }
        } else {
          var lang = N3.Util.getLiteralLanguage(n3Node)
          var type = N3.Util.getLiteralType(n3Node)

          if (lang === '') {
            lang = null
          }

          if (type === 'http://www.w3.org/2001/XMLSchema#string') {
            type = null
          }

          return self.rdf.createLiteral(
            N3.Util.getLiteralValue(n3Node),
            lang,
            type ? self.rdf.createNamedNode(type) : null)
        }
      }

      var pushTriple = function (n3Triple) {
        var triple = self.rdf.createTriple(
          toRdfNode(n3Triple.subject),
          toRdfNode(n3Triple.predicate),
          toRdfNode(n3Triple.object))

        if (filter(triple)) {
          callback(triple)
        }
      }

      pushTriple(n3Triple)
    })
  })
}

// add singleton methods to class
var instance = new N3Parser()

for (var property in instance) {
  N3Parser[property] = instance[property]
}

module.exports = N3Parser
