
exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists('posts')
    .createTable('tenants', (table) => {
      table.string('id').primary()
      table.string('name', 20).unique().notNullable()
      table.string('suite', 4).unique().notNullable()
    })
    .alterTable('users', (table) => {
      table.dropColumns('limited', 'suite')
      table.string('tenant').nullable().alter()
      table.foreign('tenant')
        .references('id')
        .inTable('tenants')
        .onDelete('SET null')
    })
}

exports.down = function (knex) {
  return knex.schema
    .alterTable('users', (table) => {
      table.string('suite', 3)
      table.dropForeign('tenant')
      table.string('tenant', 20).nullable().alter()
      table.boolean('limited').default(false).notNullable()
    })
    .dropTableIfExists('tenants')
    .createTable('posts', (table) => {
      table.string('id').primary()
      table.string('title').notNullable()
      table.string('content').notNullable()
      table.timestamp('timestamp').notNullable()

      table.string('creator').nullable()
      table.foreign('creator')
        .references('id')
        .inTable('users')
        .onDelete('cascade')
    })
}
