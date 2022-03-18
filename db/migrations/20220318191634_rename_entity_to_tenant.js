
exports.up = function (knex) {
  return knex.schema
    .table('users', (table) => {
      table.renameColumn('entity', 'tenant')
    })
}

exports.down = function (knex) {
  return knex.schema
    .table('users', (table) => {
      table.renameColumn('tenant', 'entity')
    })
}
