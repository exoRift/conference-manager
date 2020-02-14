module.exports = function conferencesOf (req, res) {
  req.db('confs')
    .select('id')
    .where({
      creator: req.params.id
    })
    .then((rows) => res.send(200, rows.map((r) => r.id)))
    .catch(() => res.send(503, 'database unavailable'))
}
