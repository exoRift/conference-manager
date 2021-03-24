
exports.up = function (knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.string('id').primary()
      table.string('name').unique().notNullable()
      table.string('pass').notNullable()
      table.string('email').unique().notNullable()
      table.string('token').notNullable()
      table.boolean('admin').notNullable()
    })
    .createTable('meetings', (table) => {
      table.string('id').primary()
      table.string('title').unique().notNullable()

      table.string('creator').notNullable()
      table.foreign('creator')
        .references('id')
        .inTable('users')
        .onDelete('cascade')

      table.integer('room').notNullable()
      table.string('desc').notNullable()
      table.json('attendees').notNullable()
      table.datetime('starttime').notNullable()
      table.datetime('endtime').notNullable()
    })
    .createTable('posts', (table) => {
      table.string('id').primary()
      table.string('title').notNullable()
      table.string('content').notNullable()
      table.datetime('timestamp').notNullable()

      table.string('creator').nullable()
      table.foreign('creator')
        .references('id')
        .inTable('users')
        .onDelete('SET null')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('users')
    .dropTable('meetings')
    .dropTable('posts')
}
