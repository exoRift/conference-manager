const {
  createAnnouncement
} = require('../../util/')

module.exports = function create (req, res) {
  if (req.auth.admin) {
    createAnnouncement(req.db, req.auth, req.body)
      .then((id) => res.send(200, id))
      .catch((err) => res.send(err.code, err.message))
  } else res.send(401)
}
