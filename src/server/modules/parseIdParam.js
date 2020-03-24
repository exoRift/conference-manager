const jwt = require('jsonwebtoken')

module.exports = function parseIDParam (req, res, next) {
  if (req.params.id) {
    if (req.params.id === 'current') {
      if (req.auth) req.params.id = req.auth.id
      else {
        try {
          req.params.id = jwt.decode(req.headers.authorization).id
        } catch {
          return res.send(400, { message: 'invalid token' })
        }
      }
    } else req.params.id = String(req.params.id)

    next()
  } else res.send(400, { message: 'no id provided' })
}
