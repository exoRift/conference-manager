module.exports = function typeDef (types) {
  return function (req, res, next) {
    for (const type in types) {
      const finalType = types[type].slice(types[type].indexOf(':') + 1)
      const receivedType = typeof req.body[type]

      if (types[type].startsWith('opt:') && (receivedType === 'undefined' || (receivedType === 'string' && !req.body[type].length))) delete req.body[type]
      else {
        let msg
        let newVal

        switch (finalType) {
          case 'date':
            newVal = new Date(req.body[type])
            if (!isNaN(newVal)) req.body[type] = newVal
            else msg = `invalid param type: ${type}. expected a valid date string`
            break
          case 'array':
            if (!Array.isArray(req.body[type])) msg = `invalid param type: ${type}. expected an array of strings instead got ${receivedType}`
            break
          case 'number':
            if (isNaN(Number(req.body[type]))) msg = `invalid param type: ${type}. expected a valid number`
            break
          case 'string':
            if (receivedType === 'string') {
              if (!req.body[type].length) msg = `invalid param type: ${type}. expected string but recieved string is empty`
            } else msg = `invalid param type: ${type}. expected string instead got ${receivedType}`
            break
          case 'boolean':
            try {
              newVal = Boolean(JSON.parse(req.body[type]) || false)
            } catch {
              msg = `invalid param type: ${type}. expected boolean instead got ${receivedType}`
            }
            break
          default:
            if (types[type] !== receivedType) msg = `invalid param type: ${type}. expected ${finalType} instead got ${receivedType}`
            break
        }

        if (msg) return res.send(400, msg)
      }
    }

    next()
  }
}
