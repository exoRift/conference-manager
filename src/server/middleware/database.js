const Knex = require('knex')

module.exports = function (dbInfo) {
  const db = new Knex(dbInfo)

  db.raw('SELECT 1 + 1 AS result')
    .catch((err) => console.error('Unable to establish connection to database', err))
    .then(() => console.info('Successfully established connection to database'))

  return (req, res, next) => {
    req.db = db

    next()
  }
}
