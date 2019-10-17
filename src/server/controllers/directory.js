module.exports = function directory (req, res) {
  req.db('confs')
    .select()
    .orderBy('starttime')
    .catch(() => res.send(503, 'database unavailable'))
    .then((rows) => res.send(200, rows))
}
