const moment = require('moment')

module.exports = function typeDef (types) {
  return function (req, res, next) {
    for (const type in types) {
      if (types[type] === 'date') {
        const result = new Date(moment(req.body[type])._i)

        if (isNaN(result)) return res.send(400, `invalid param type: ${type}. expected a valid date string`)
        else req.body[type] = result
      } else {
        const receivedType = typeof req.body[type]

        if (types[type] === 'array'
          ? !Array.isArray(req.body[type]) && req.body[type].every((e) => typeof e === 'string')
          : types[type] === 'number'
            ? isNaN(Number(req.body[type]))
            : Array.isArray(types[type])
              ? !types[type].includes(receivedType)
              : receivedType !== types[type]) return res.send(400, `invalid param type: ${type === 'array' ? 'array of strings' : type}. expected ${types[type]} instead got ${receivedType}`)
      }
    }

    next()
  }
}
