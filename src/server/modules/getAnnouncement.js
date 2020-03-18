module.exports = function getAnnouncement (req, res, next) {
  if (req.params.id) {
    let query = req.db('announcements')
      .select()
      .orderBy('timestamp')

    if (req.params.id !== 'all') {
      query = query
        .where({
          id: req.params.id
        })
        .limit(1)
    }

    query
      .then((rows) => {
        if (rows.length) {
          req.announcement = req.params.id === 'all' ? rows : rows[0]
          req.announcement.timestamp = new Date(req.announcement.timestamp)

          next()
        } else res.send(400, 'invalid id')
      })
      .catch((e) => res.send(503, 'database unavailable'))
  } else res.send(400, 'no id provided')
}
