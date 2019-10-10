const QueryBuilder = require('simple-knex')

module.exports = function database (dbInfo, tables) {
  const db = new QueryBuilder(dbInfo)

  for (const table of tables) {
    db.createTable(table).catch((err) => {
      if (!err.desc.endsWith('already exists.')) console.error(err)
    })
  }

  return async (req, res, next) => {
    req.db = db

    next()
  }
}
