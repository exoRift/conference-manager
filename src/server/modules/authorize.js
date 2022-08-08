const jwt = require('jsonwebtoken')

const {
  TOKEN_SECRET
} = process.env

module.exports = function (controller) {
  return function (req, res, next) {
    if ('authorization' in req.headers) {
      jwt.verify(req.headers.authorization, TOKEN_SECRET, (err, match) => {
        if (err && err.message !== 'jwt malformed') {
          console.error('jwt', err)

          res.sendError(500, 'internal', 'token decoding error')

          next()
        } else if (match) {
          req.db('users')
            .select()
            .where('id', match.id)
            .then(([user]) => {
              if (user) {
                user.limited = user.email === 'cr@panel'

                if (user.limited &&
                  !controller?.options?.authorize?.allowLimited) return res.sendError(401, 'authorization', 'endpoint not delegated to limited users')

                req.auth = user

                if (req.params.id === 'self') {
                  req.params.id = user.id
                }
              } else {
                res.sendError(401, 'authorization', 'invalid token')

                next()
              }
            })
            .catch((err) => {
              console.error('db', err)

              res.sendError(500, 'internal', 'database unavailable')

              next()
            })
            .finally(() => next())
        } else {
          res.sendError(401, 'authorization', 'invalid token')

          next()
        }
      })
    } else if (!controller?.options?.authorize?.optional) {
      res.sendError(400, 'authorization', 'no token provided')

      next()
    } else next()
  }
}
