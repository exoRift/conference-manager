module.exports = [
  {
    name: 'users',
    schema: (builder) => {
      builder.string('id').primary()
      builder.string('name')
      builder.string('pass')
      builder.string('token')
    }
  },
  {
    name: 'confs',
    schema: (builder) => {
      builder.string('id').primary()
      builder.string('title')
      builder.integer('room')
      builder.string('desc')
      builder.json('attendees')
      builder.datetime('starttime')
      builder.datetime('endtime')
    }
  }
]
