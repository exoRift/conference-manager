const {
  updateUser: update
} = require('../util/')

module.exports = function updateUser (req, res) {
  for (const param in req.body) {
    if (!req.body[param].length) return res.send(400, 'invalid param: ' + param)
  }

  if (Object.keys(req.body).length) {
    update(req.db, req.salt, req.user.id, req.body)
      .catch((err) => res.send(503, err.message))
      .then(() => res.send(200))
  } else res.send(400, 'empty object')
}