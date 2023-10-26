const Knex = require('knex')

module.exports = function (dbInfo, meetingCore) {
  const db = new Knex(dbInfo)

  db.raw('SELECT 1 + 1 AS result')
    .then(() => console.info('Successfully established connection to database'))
    .catch((err) => console.error('Unable to establish connection to database', err))

  db('meetings')
    .select('id', 'title', 'startdate', db.raw('EXTRACT(EPOCH from length) * 1000 as length'), 'room')
    .then((meetings) => {
      for (const meeting of meetings) {
        meetingCore.upload(db, {
          ...meeting,
          length: parseInt(meeting.length)
        })
      }
    })
    .catch((err) => console.error('db', err))

  return (req, res, next) => {
    req.db = db

    next()
  }
}
