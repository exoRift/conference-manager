module.exports = function deleteConf (req, res) {
  if (req.authUser.admin || req.authUser.id === req.conf.creator) {
    req.db('confs')
      .delete()
      .where({
        id: req.conf.id
      })
      .then(() => res.send(200))
      .catch(() => res.send(503, 'database unavailable'))
  } else res.send(400, 'invalid conf')
}