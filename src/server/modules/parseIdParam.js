const jwt = require('jsonwebtoken')

module.exports = function parseIdParam (req, res, next) {
  if (req.params.id) {
    if (req.params.id === 'current') {
      try {
        req.params.id = jwt.decode(req.headers.authorization).id
      } catch {
        return res.send(400, 'invalid token')
      }
    } else req.params.id = String(req.params.id)

    next()
  } else res.send(400, 'no id provided')
}
