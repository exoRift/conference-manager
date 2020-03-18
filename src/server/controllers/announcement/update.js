const {
  updateAnnouncement
} = require('../../util/')

module.exports = function update (req, res) {
  if (req.auth.admin) {
    updateAnnouncement(req.db, req.announcement.id, {
      title: req.body.title,
      content: req.body.content
    })
      .then(() => res.send(204))
      .catch((err) => res.send(err.code, err.message))
  } else res.send(401)
}
