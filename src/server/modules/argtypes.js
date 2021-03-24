const typeRegex = /^(?:(.+):)?(.+)$/

function buildErrorString (name, expected, received) {
  return `invalid param type for: {${name}}. expected {${expected}} instead got {${received}}`
}

function transform (input, name, type, receivedType) {
  switch (type) {
    case 'date': {
      const date = new Date(input)

      if (!isNaN(date)) return date
      else throw Error(`invalid date string for: {${name}}`)
    }
    case 'array':
      if (!Array.isArray(input)) throw Error(buildErrorString(name, 'array of strings', receivedType))

      break
    case 'number':
      if (isNaN(Number(input))) throw Error(buildErrorString(name, 'number', receivedType))

      break
    case 'string':
      if (receivedType === 'string') {
        if (!input.length) throw Error(`invalid param type for: {${name}}. expected {string} but received string is empty`)
      } else throw Error(buildErrorString(name, 'string', receivedType))
      break
    case 'boolean':
      try {
        return Boolean(JSON.parse(input) || false)
      } catch {
        throw Error(buildErrorString(name, 'boolean', receivedType))
      }
    default:
      if (type !== receivedType) throw Error(buildErrorString(name, type, receivedType))
      break
  }
}

module.exports = function (args) {
  return function (req, res, next) {
    req.args = {}

    for (const arg in args) {
      const [
        ,
        preface,
        type
      ] = typeRegex.exec(args[arg])

      const receivedType = typeof req.body[arg]

      if (receivedType === 'undefined' || (receivedType === 'string' && !req.body[arg].length)) {
        if (preface === 'opt') continue
        else {
          res.sendError(400, 'argument', `missing required argument: {${arg}}`)

          break
        }
      }

      try {
        req.args[arg] = transform(req.body[arg], arg, type, receivedType)
      } catch (err) {
        res.sendError(400, 'argument', err.message)

        break
      }
    }

    next()
  }
}
