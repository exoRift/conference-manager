const jwt = require('jsonwebtoken')

const {
  TOKEN_SECRET
} = process.env

module.exports = function (req, res, next) {
  if (req.headers.authorization) {
    jwt.verify(req.headers.authorization, TOKEN_SECRET, (err, match) => {
      if (err && err.message !== 'jwt malformed') {
        console.error('jwt', err)

        return res.sendError(500, 'internal', 'token decoding error')
      }

      if (match) {
        req.db('users')
          .select()
          .where('id', match.id)
          .catch((err) => {
            console.error('db', err)

            res.sendError(500, 'internal', 'database unavailable')
          })
          .then(([user]) => {
            req.auth = user

            if (req.params.id === 'current') {
              req.params.id = user.id
            }
          })
          .finally(() => next())
      } else {
        res.sendError(401, 'authorization', 'invalid token')

        next()
      }
    })
  } else {
    res.sendError(400, 'authorization', 'no token provided')

    next()
  }
}
