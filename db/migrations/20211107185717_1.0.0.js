
exports.up = function (knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.string('id').primary()

      table.string('firstname', 20).notNullable()
      table.string('lastname', 20).notNullable()
      table.string('suite', 3).nullable()
      table.string('entity', 20).nullable()
      table.string('pass').nullable()
      table.string('email', 40).unique().notNullable()
      table.string('token').unique().nullable()
      table.boolean('admin').default(false).notNullable()
      table.boolean('limited').default(false).notNullable()
    })
    .createTable('meetings', (table) => {
      table.string('id').primary()
      table.string('title', 45).unique().notNullable()

      table.string('creator').notNullable()
      table.foreign('creator')
        .references('id')
        .inTable('users')
        .onDelete('cascade')

      table.integer('room').notNullable()
      table.string('desc', 150).nullable()
      table.jsonb('attendees').default('[]').notNullable()
      table.datetime('startdate').notNullable()
      table.specificType('length', 'interval').default('1 hour').notNullable()
    })
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
        // .onDelete('SET null')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('meetings')
    .dropTableIfExists('posts')
    .dropTableIfExists('users')
}
