module.exports = [
  {
    name: 'users',
    schema: (builder) => {
      builder.string('id').primary()
      builder.string('name')
      builder.string('pass')
      builder.string('email')
      builder.string('token')
      builder.boolean('admin')
    }
  },
  {
    name: 'confs',
    schema: (builder) => {
      builder.string('id').primary()
      builder.string('title')
      builder.string('creator')
      builder.integer('room')
      builder.string('desc')
      builder.json('attendees')
      builder.datetime('starttime')
      builder.datetime('endtime')
    }
  }
]
