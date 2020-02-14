const {
  deleteUser
} = require('../../util/')

module.exports = function del (req, res) {
  if (req.authUser.admin) {
    deleteUser(req.db, req.mailer, req.user.id, req.authUser.name)
      .then((status) => res.send(200, status))
      .catch((err) => res.send(err.code, err.message))
  } else if (req.authUser.id === req.user.id) res.send(400, 'cannot delete self')
  else res.send(401, 'must be admin')
}
