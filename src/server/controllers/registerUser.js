const {
  updateUser
} = require('../util/')

module.exports = function registerUser (req, res) {
  req.db('users')
    .select('id', 'token')
    .where({
      id: req.params.id
    })
    .limit(1)
    .catch(() => res.send(503, 'database unavailable'))
    .then(([existing]) => {
      if (existing) {
        if (existing.token) res.send(400, 'user already registered')
        else {
          updateUser(req.db, req.salt, req.params.id, req.body)
            .then((token) => res.send(200, token))
            .catch((err) => res.send(err.code, err.message))
        }
      } else res.send(400, 'invalid user')
    })
}
