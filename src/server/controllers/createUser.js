const {
  createUser: create
} = require('../util/')

module.exports = function createUser (req, res) {
  if (req.authUser.admin) {
    create(req.db, req.mailer, req.authUser.name, req.body)
      .then((id) => {
        res.send(200, id)

        setTimeout(() => {
          // DELETE USER WHEN FRAMEWORK ESTABLISHED
        }, 604800000 /* 7 days */)
      })
      .catch((err) => res.send(err.code, err.message))
  } else res.send(401)
}
