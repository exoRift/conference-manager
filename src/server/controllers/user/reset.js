const jwt = require('jsonwebtoken')

const {
  RESET_SECRET,
  RESET_TIMEOUT
} = process.env

module.exports = {
  requisites: ['argtypes'],
  args: {
    pass: 'string',
    token: 'string'
  },
  options: {
    argtypes: {
      pass: {
        maxStringLen: 40
      }
    }
  },
  method: 'patch',
  route: '/user/:id/reset',
  action: function (req, res) {
    return req.db.raw('SELECT EXISTS (SELECT 1 FROM users WHERE id = ? AND token IS NOT NULL)', [req.params.id])
      .then(({ rows: [{ exists }] }) => {
        if (exists) {
          jwt.verify(req.args.token, RESET_SECRET, (err, match) => {
            if (err && err.message !== 'jwt malformed') {
              console.error('jwt', err)

              res.sendError(400, 'token', 'reset token does not match user')
            } else if (match) {
              if (match.id === req.params.id) {
                if (Date.now() - match.timestamp <= RESET_TIMEOUT) {
                  return req.util.user.validate(req.params.id)
                    .then(req.util.user.update)
                    .then(() => res.send(200))
                    .catch((err) => res.sendError(err.code, err.type, err.message))
                } else res.sendError(400, 'token', 'reset token expired')
              } else res.sendError(400, 'token', 'reset token does not match user')
            }
          })
        } else {
          return res.sendError(404, 'target', 'user not found')
        }
      })
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
