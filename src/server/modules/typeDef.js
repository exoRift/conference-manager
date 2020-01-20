module.exports = function typeDef (types) {
  return function (req, res, next) {
    for (const type in types) {
      if (types[type] === 'date') {
        const newDate = new Date(req.body[type])

        if (!isNaN(newDate)) req.body[type] = newDate
        else return res.send(400, `invalid param type: ${type}. expected a valid date string`)
      } else {
        const receivedType = typeof req.body[type]

        if (types[type].startsWith('opt:') && (receivedType === 'undefined' || (receivedType === 'string' && !req.body[type].length))) delete req.body[type]
        else {
          let msg

          switch (types[type].slice(types[type].indexOf(':') + 1)) {
            case 'array':
              if (!Array.isArray(req.body[type])) msg = `invalid param type: ${type}. expected an array of strings instead got ${receivedType}`
              break
            case 'number':
              if (isNaN(Number(req.body[type]))) msg = `invalid param type: ${type}. expected a valid number`
              break
            case 'string':
              if (receivedType === 'string') {
                if (!req.body[type].length) msg = `invalid param type: ${type}. expected string but recieved string is empty`
              } else msg = `invalid param type: ${type}. expected ${types[type]} instead got ${receivedType}`
              break
            default:
              if (types[type] !== receivedType) msg = `invalid param type: ${type}. expected ${types[type]} instead got ${receivedType}`
              break
          }

          if (msg) res.send(400, msg)
        }
      }
    }

    next()
  }
}
