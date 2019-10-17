const jwt = require('jsonwebtoken')

module.exports = function parseIdParam (req, res, next) {
  if (req.params.id) {
    if (req.params.id === 'current') {
      req.params.id = jwt.decode(req.headers.authorization).id

      next()
    }
  } else res.send(400, 'no id provided')
}
