
exports.up = function (knex) {
  return knex.schema
    .alterTable('posts', (table) => {
      table.string('content', 500).notNullable().alter()
    })
}

exports.down = function (knex) {
  return knex.schema
    .alterTable('posts', (table) => {
      table.string('content', 255).notNullable().alter()
    })
}
