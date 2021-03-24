const {
  ROOM_COUNT
} = process.env

module.exports = function (req, res, next) {
  req.util = {
    meeting: {
      create: (req) => {
        if (req.args.room > parseInt(ROOM_COUNT) || req.args.room < 1) {
          return req.util.meeting.validate(req)
            .then(() => {
              const id = String(Date.now())

              return req.db('meetings')
                .insert({
                  id,
                  attendees: [],
                  creator: req.auth.id,
                  ...req.args
                })
                .catch((err) => {
                  console.error('db', err)

                  throw req.errors.database
                })
                .then(() => id)
            })
        } else {
          const err = Error(`invalid room provided (1-${ROOM_COUNT})`)
          err.code = 400
          err.type = 'argument'

          throw err
        }
      },
      validate: (req, exclude) => {
        // Title validation
        return req.db('meetings')
          .select('id')
          .where('title', req.args.title)
          .whereNot('id', exclude)
          .catch((err) => {
            console.error('db', err)

            throw req.errors.database
          })
          .then(([existing]) => {
            if (existing) {
              const err = Error('title taken')
              err.code = 409
              err.type = 'argument'

              throw err
            } else {
              const start = new Date(req.args.starttime).getTime()
              const end = new Date(req.args.endtime).getTime()

              // Time validation
              if (start < Date.now()) {
                const err = Error('start date earlier than current date')
                err.code = 400
                err.type = 'argument'

                throw err
              }

              if (end <= start) {
                const err = Error('end date earlier than or equal to start date')
                err.code = 400
                err.type = 'argument'

                throw err
              }

              if (end - start > 7200000) {
                const err = Error('conference longer than 2 hours')
                err.code = 400
                err.type = 'argument'

                throw err
              }

              if (end - start < 900000) {
                const err = Error('conference must be at least 15 minutes')
                err.code = 400
                err.type = 'argument'

                throw err
              }

              // Knex date formatting
              const startString = new Date(req.args.starttime).toLocaleString('en-US', {
                dateStyle: 'short',
                timeStyle: 'short'
              })
              const endString = new Date(req.args.endtime).toLocaleString('en-US', {
                dateStyle: 'short',
                timeStyle: 'short'
              })

              return req.db('meetings')
                .select('title', 'starttime', 'endtime')
                .where(
                  req.db.raw(`(room = ${req.args.room}) AND (('${startString}'::date > starttime AND '${startString}'::date < endtime) OR ('${endString}'::date > starttime AND '${endString}'::date < endtime))`)
                )
                .limit(1)
                .catch((err) => {
                  console.error('db', err)

                  throw req.errors.database
                })
                .then(([overlap]) => {
                  if (overlap) {
                    const err = Error(`conference overlaps existing conference: {${overlap.title}} which is in session from {${overlap.starttime}} to {${overlap.endtime}}`)
                    err.code = 409
                    err.type = 'argument'

                    throw err
                  }
                })
            }
          })
      }
    }
  }

  next()
}
