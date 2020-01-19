const {
  inviteUser: invite
} = require('../util/')

function inviteUser (req, res) {
  if (req.authUser.admin) {
    invite(req.db, req.mailer, req.authUser.name, req.body)
      .then((id) => res.send(200, id))
      .catch((err) => res.send(err.code, err.message))
  } else res.send(401)
}

module.exports = inviteUser
