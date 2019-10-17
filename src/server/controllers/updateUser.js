const bcrypt = require('bcrypt')

module.exports = function updateUser (req, res) {
  for (const param in req.body) {
    if (!req.body[param].length) return res.send(400, 'invalid param: ' + param)
  }

  if (Object.keys(req.body).length) {
    if (req.body.pass) req.body.pass = bcrypt.hashSync(req.body.pass, req.salt)

    req.db('users')
      .update(req.body)
      .where({
        id: req.user.id
      })
        .catch(() => res.send(503, 'database unavailable'))
        .then(() => res.send(200))
  } else res.send(400, 'empty object')
}