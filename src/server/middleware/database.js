const Knex = require('knex')

module.exports = function database (dbInfo, tables) {
  const db = new Knex(dbInfo)

  db.raw('SELECT 1 + 1 AS result')
    .catch(() => console.error('Unable to establish connection to database'))
    .then(() => console.log('Successfully established connection to database'))

  for (const table of tables) {
    db.schema.hasTable(table.name).then((exists) => {
      if (!exists) db.schema.createTable(table.name, table.schema).then()
    })
  }

  return (req, res, next) => {
    req.db = db

    next()
  }
}
