module.exports = function getConf (req, res, next) {
  if (req.params.id) {
    let query = req.db('confs')
      .select()
      .orderBy('starttime')

    if (req.params.id !== 'all') {
      query = query
        .where({
          id: req.params.id
        })
        .limit(1)
    }

    query
      .catch(() => res.send(503, 'database unavailable'))
      .then((rows) => {
        if (rows.length) {
          req.conf = req.params.id === 'all' ? rows : rows[0]

          next()
        } else res.send(400, 'invalid id')
      })
  } else res.send(400, 'no id provided')
}
