const typeRegex = /^(?:(.+):)?(.+)$/

function buildErrorString (name, expected, received) {
  return `invalid arg type for: [${name}]. expected {${expected}} instead got {${received}}`
}

function transform (input, name, type, receivedType, options = {}) {
  const {
    maxStringLen = 255,
    allowNewlines = false,
    allowEmpty = false,
    forceInt = true,
    absolute = false
  } = options

  switch (type) {
    case 'date': {
      const date = new Date(input)

      if (!isNaN(date)) return date
      else throw Error(`invalid date string for: [${name}]`)
    }
    case 'array':
      if (!Array.isArray(input)) throw Error(buildErrorString(name, 'array of strings', receivedType))

      break
    case 'number': {
      const number = forceInt ? parseInt(input) : Number(input)

      if (isNaN(number)) throw Error(buildErrorString(name, 'number', receivedType))

      return absolute ? Math.abs(number) : number
    }
    case 'string':
      if (receivedType === 'string') {
        const trimmed = allowNewlines ? input.trim() : input.replace(/\r|\n/g, '').trim()

        if (!trimmed.length) {
          if (allowEmpty) return null
          else throw Error(`invalid arg type for: [${name}]. expected {string} but received string is empty`)
        }
        if (trimmed.length > maxStringLen) throw Error(`arg [${name}] too long. limit: {${maxStringLen}}`)
        if (trimmed.includes('*')) throw Error('cannot use wildcards in args')

        return trimmed
      } else throw Error(buildErrorString(name, 'string', receivedType))
    case 'boolean':
      try {
        return Boolean(JSON.parse(input) || false)
      } catch {
        throw Error(buildErrorString(name, 'boolean', receivedType))
      }
    default:
      if (type !== receivedType) throw Error(buildErrorString(name, type, receivedType))

      return input
  }
}

module.exports = function (controller) {
  return function (req, res, next) {
    req.args = {}

    for (const arg in controller.args) {
      const [
        ,
        preface,
        type
      ] = typeRegex.exec(controller.args[arg])

      const receivedType = typeof req.body[arg]

      if (receivedType === 'undefined' || req.body[arg] === null) {
        if (preface === 'opt') continue
        else {
          res.sendError(400, 'argument', `missing required argument: [${arg}]`)

          break
        }
      }

      try {
        req.args[arg] = transform(req.body[arg], arg, type, receivedType, controller.options?.argtypes[arg])
      } catch (err) {
        res.sendError(400, 'argument', err.message)

        break
      }
    }

    next()
  }
}
