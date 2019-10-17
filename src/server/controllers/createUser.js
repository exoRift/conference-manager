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
        .catch(() => res.send(503, 'database unavailable'))
        .then(([row]) => {
          if (row) {
            if (row.token) res.send(400, 'user already created')
            else if (requiredKeys.every((key) => req.body.includes(key))) {
              updateUser(req.db, req.salt, req.user.id, req.body)
                .catch((err) => res.send(503, err.message))
                .then(() => res.send(200))
            } else res.send(400, 'invalid body')
          } else res.send(400, 'invalid user')
        })
  } else res.send(401)
}
