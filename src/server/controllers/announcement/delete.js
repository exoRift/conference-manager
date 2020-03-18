module.exports = function deleteAnnouncement (req, res) {
  if (req.auth.admin) {
    req.db('announcements')
      .delete()
      .where({
        id: req.announcement.id
      })
      .then(() => res.send(204))
      .catch(() => res.send(503, 'database unavailable'))
  } else res.send(401)
}
