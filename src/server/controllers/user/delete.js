const {
  deleteUser
} = require('../../util/')

module.exports = function del (req, res) {
  if (req.auth.admin) {
    deleteUser(req.db, req.mailer, req.user.id, req.auth.name)
      .then((status) => res.send(200, status))
      .catch((err) => res.send(err.code, err.message))
  } else if (req.auth.id === req.user.id) res.send(400, 'cannot delete self')
  else res.send(401, 'must be admin')
}
