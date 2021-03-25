const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ejs = require('ejs')

const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/ // eslint-disable-line

const {
  TOKEN_SECRET
} = process.env

module.exports = function (req, res, next) {
  req.util = {
    meeting: {
      validate: (exclude) => {
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

              // 2 hours
              if (end - start > 7200000) {
                const err = Error('conference longer than 2 hours')
                err.code = 400
                err.type = 'argument'

                throw err
              }

              // 15 minutes
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
                .select(['title', 'starttime', 'endtime'])
                .where('room', req.args.room)
                .andWhere(
                  req.db.raw(`('${startString}'::date > starttime AND '${startString}'::date < endtime) OR ('${endString}'::date > starttime AND '${endString}'::date < endtime)`)
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
    },
    user: {
      validate: async (exclude) => {
        if (req.args.email.match(emailRegex)) {
          return req.db('users')
            .select(['firstname', 'lastname'])
            .where(
              req.db.raw('id != ? AND ((LOWER("firstname") = ? AND LOWER("lastname") = ?) OR email = ?)', [exclude, req.args.firstname.toLowerCase(), req.args.lastname.toLowerCase(), req.args.email.toLowerCase()])
            )
            .limit(1)
            .catch((err) => {
              console.error('db', err)

              throw req.errors.database
            })
            .then(([overlap]) => {
              if (overlap) {
                const err = Error(`name or email taken by {${overlap.firstname} ${overlap.lastname}}`)
                err.code = 409
                err.type = 'argument'

                throw err
              }
            })
        } else {
          const err = Error('invalid email')
          err.code = 400
          err.type = 'argument'

          throw err
        }
      },
      update: () => {
        return req.db('users')
          .select()
          .where('id', req.params.id)
          .catch((err) => {
            console.error('db', err)

            throw req.errors.database
          })
          .then(([found]) => {
            if (found) {
              if (req.args.pass) {
                try {
                  req.args.pass = bcrypt.hashSync(req.args.pass, req.salt)
                } catch (err) {
                  console.error('bcrypt', err)

                  const perr = Error('hashing error')
                  perr.code = 500
                  perr.type = 'internal'

                  throw perr
                }

                try {
                  req.args.token = jwt.sign({
                    id: req.params.id,
                    firstname: req.args.firstname || found.firstname,
                    email: req.args.email || found.email,
                    admin: req.args.admin === undefined ? found.admin : req.args.admin
                  }, TOKEN_SECRET)
                } catch {
                  const err = Error('token encoding error')
                  err.code = 500
                  err.type = 'internal'

                  throw err
                }

                return req.db('users')
                  .update({
                    ...found,
                    ...req.args
                  })
                  .catch((err) => {
                    console.err('db', err)

                    throw req.errors.database
                  })
                  .then(() => req.args.token)
              }
            } else {
              const err = Error('user not found')
              err.code = 404
              err.type = 'target'

              throw err
            }
          })
      },
      email: ({ subject, temp, material }) => {
        let html

        try {
          html = ejs.render(temp, material)
        } catch (err) {
          console.error('ejs', err)

          const perr = Error('user created but email unable to render')
          perr.code = 206
          perr.type = 'internal'

          throw perr
        }

        return req.mailer.sendMail({
          from: 'Study Logic Worldwide HQ',
          to: req.args.email,
          subject,
          html
        })
          .catch((err) => {
            console.error('mailer', err)

            const perr = Error('user created but email unable to send')
            perr.code = 206
            perr.type = 'internal'

            throw perr
          })
      }
    }
  }

  next()
}
