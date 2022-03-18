
exports.up = function (knex) {
  return knex.schema
    .alterTable('users', (table) => {
      table.string('suite', 4).nullable().alter()
    })
}

exports.down = function (knex) {
  return knex.schema
    .alterTable('users', (table) => {
      table.string('suite', 3).nullable().alter()
    })
}
