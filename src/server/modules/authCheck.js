const jwt = require('jsonwebtoken')

const {
  TOKEN_SECRET
} = process.env

module.exports = function authCheck (req, res, next) {
  if (req.headers.authorization) {
    jwt.verify(req.headers.authorization, TOKEN_SECRET, (err, match) => {
      if (err && err.message !== 'jwt malformed') return res.send(503, 'token decoding')

      if (match) {
        req.auth = match

        req.db('users')
          .select('admin')
          .where({
            id: match.id
          })
          .limit(1)
          .catch(() => res.send(503, 'database unavailable'))
          .then(([{ admin }]) => {
            req.auth.admin = admin

            next()
          })
      } else res.send(400, 'invalid token')
    })
  } else res.send(400, 'no token provided')
}
