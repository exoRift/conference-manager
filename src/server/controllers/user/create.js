const {
  createUser: create,
  deleteUser
} = require('../../util/')

module.exports = function createUser (req, res) {
  if (req.authUser.admin) {
    create(req.db, req.mailer, req.authUser.name, req.body)
      .then((id) => {
        res.send(200, id)

        setTimeout(() => deleteUser(req.db, req.mailer, id, req.authUser.name), 604800000)
      })
      .catch((err) => res.send(err.code, err.message))
  } else res.send(401)
}
