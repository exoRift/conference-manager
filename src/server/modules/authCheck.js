const jwt = require('jsonwebtoken')

const {
  TOKEN_SECRET
} = process.env

module.exports = function authCheck (req, res, next) {
  if (req.headers.authorization) {
    jwt.verify(req.headers.authorization, TOKEN_SECRET, (err, match) => {
      if (err && err.message !== 'jwt malformed') return res.send(503, 'token decoding')

      if (match) {
        req.authUser = match
        req.auth = match.admin || match.id === req.params.id

        next()
      } else res.send(400, 'invalid token')
    })
  } else res.send(400, 'no token provided')
}
