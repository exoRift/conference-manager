module.exports = function (req, res, next) {
  const database = Error('database unavailable')
  database.code = 500
  database.type = 'internal'

  req.errors = {
    database
  }

  next()
}
