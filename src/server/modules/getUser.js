module.exports = function getUser (req, res, next) {
  if (req.auth) {
    req.db('users')
    .select()
    .where({
      id: req.params.id
    })
    .limit(1)
      .catch(() => res.send(503, 'database unavailable'))
      .then(([row]) => {
        if (row) {
          req.user = row

          next()
        }
        else res.send(400, 'invalid id')
      })
  } else res.send(401)
}