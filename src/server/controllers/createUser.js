const {
  updateUser
} = require('../util/')

const requiredKeys = ['pass']

module.exports = function createUser (req, res) {
  if (req.auth) {
    req.db('users')
      .select('id', 'token')
      .where({
        id: req.params.id
      })
      .limit(1)
      .then(([row]) => {
        if (row) {
          if (row.token) res.send(400, 'user already created')
          else if (requiredKeys.every((key) => req.body.includes(key))) {
            updateUser(req.db, req.salt, req.user.id, req.body)
              .then((token) => res.send(200, token))
              .catch((err) => res.send(err.code, err.message))
          } else res.send(400, 'invalid body')
        } else res.send(400, 'invalid user')
      })
      .catch(() => res.send(503, 'database unavailable'))
  } else res.send(401)
}
