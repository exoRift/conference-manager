module.exports = function typeDef (types) {
  return function (req, res, next) {
    for (const type in types) {
      if (req.body[type] !== undefined) {
        if (types[type] === 'date') {
          const result = new Date(req.body[type])

          if (isNaN(result)) return res.send(400, `invalid param type: ${type}. expected a valid date string`)
          else req.body[type] = result
        } else {
          const receivedType = typeof req.body[type]

          if (types[type] === 'array'
            ? !Array.isArray(req.body[type])
            : Array.isArray(types[type]) ? !types[type].includes(receivedType) : receivedType !== types[type]) return res.send(400, `invalid param type: ${type}. expected ${types[type]} instead got ${receivedType}`)
        }
      }
    }

    next()
  }
}
