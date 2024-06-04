exports.up = function (knex) {
  return knex.schema
    .alterTable('meetings', (table) => {
      table.dropUnique('title')
    })
}

exports.down = function (knex) {
  return knex.schema
    .alterTable('meetings', (table) => {
      table.unique('title')
    })
}
