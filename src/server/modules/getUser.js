module.exports = function getUser (req, res, next) {
  let query = req.db('users')
    .select()

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
        req.user = req.params.id === 'all' ? rows : rows[0]

        next()
      } else res.send(400, 'invalid id')
    })
    .catch(() => res.send(503, 'database unavailable'))
}
