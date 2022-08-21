const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ejs = require('ejs')

const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/ // eslint-disable-line

const {
  TOKEN_SECRET,
  MAILER_USER
} = process.env
const MAX_PASS_LENGTH = 8

module.exports = function (req, res, next) {
  req.util = {
    meeting: {
      validate: (exclude, skip) => {
        return req.db('meetings')
          .select('*', req.db.raw('EXTRACT(EPOCH from length) * 1000 as length'))
          .where('id', exclude || '')
          .catch((err) => {
            console.error('db', err)

            throw req.errors.database
          })
          .then(([found]) => {
            if (!found) found = req.meetingCore.timeouts.find((m) => m.data.id === req.params.id && m.limited)?.data

            const args = {
              ...found,
              ...req.args
            }

            // Title validation
            return req.db('meetings')
              .select('id')
              .where('title', args.title || '')
              .whereNot('id', exclude || '')
              .catch((err) => {
                console.error('db', err)

                throw req.errors.database
              })
              .then(([existing]) => {
                if (existing && !req.auth.limited) {
                  const err = Error('title taken')
                  err.code = 409
                  err.type = 'argument'

                  throw err
                } else {
                  // Time validation
                  if ('startdate' in req.args && req.method !== 'POST' && args.startdate < Date.now()) {
                    const err = Error('start date earlier than current date')
                    err.code = 400
                    err.type = 'argument'

                    throw err
                  }

                  // Admins are immune to length restrictions
                  if (!req.auth.admin) {
                    const maxLength = req.auth.limited ? 7200000 /* 2 hours */ : 14400000 /* 4 hours */

                    if (args.length > maxLength) {
                      const err = Error(`meeting longer than ${req.auth.limited ? '{2 hours}. use an account to increase limit' : '{4 hours}'}`)
                      err.code = 400
                      err.type = 'argument'

                      throw err
                    }
                  }

                  if (args.length < 900000 /* 15 minutes */) {
                    const err = Error('meeting must be at least 15 minutes')
                    err.code = 400
                    err.type = 'argument'

                    throw err
                  }

                  return req.db('meetings')
                    .select('title', 'startdate', 'length', req.db.raw('EXTRACT(EPOCH FROM length) * 1000 as epochlength'))
                    .where('room', args.room)
                    .andWhere(
                      req.db.raw('(:start::TIMESTAMP, make_interval(secs => :duration)) OVERLAPS (startdate, length)', {
                        start: args.startdate.toISOString(),
                        duration: args.length / 1000
                      })
                    )
                    .whereNot('id', exclude || '')
                    .limit(1)
                    .catch((err) => {
                      console.error('db', err)

                      throw req.errors.database
                    })
                    .then(([overlap]) => {
                      if (!overlap) overlap = req.meetingCore.findConflict(args.startdate, args.length, args.room, exclude)?.data

                      if (overlap) {
                        const overlapEnd = new Date(overlap.startdate.getTime() + (overlap.epochlength || overlap.length))

                        const err = new Error(
                          `meeting overlaps existing meeting: {${overlap.title}} which is in session from {${overlap.startdate}} to {${overlapEnd}}`
                        )
                        err.code = 409
                        err.type = 'argument'

                        throw err
                      }
                    })
                }
              })
          })
      }
    },
    user: {
      validate: async (exclude) => {
        if ('pass' in req.args && req.args.pass.length < MAX_PASS_LENGTH) {
          const err = Error('pass shorter than {8} characters')
          err.code = 400
          err.type = 'argument'

          throw err
        }

        if ('email' in req.args) {
          if (req.args.email.match(emailRegex)) {
            return req.db('users')
              .select('firstname', 'lastname')
              .whereRaw('LOWER("email") = ?', [req.args.email.toLowerCase()])
              .whereNot('id', exclude || '')
              .limit(1)
              .catch((err) => {
                console.error('db', err)

                throw req.errors.database
              })
              .then(([overlap]) => {
                if (overlap) {
                  const err = Error(`email taken by {${overlap.firstname} ${overlap.lastname}}`)
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
        }
      },
      update: () => {
        return req.db('users')
          .select('email', 'token')
          .where('id', req.params.id)
          .catch((err) => {
            console.error('db', err)

            throw req.errors.database
          })
          .then(([found]) => {
            if (found) {
              if (found.email === 'sys@admin' || found.email === 'cr@panel') {
                const err = Error('protected user')
                err.code = 403
                err.type = 'target'

                throw err
              }

              if ('pass' in req.args) {
                try {
                  req.args.pass = bcrypt.hashSync(req.args.pass, req.salt)
                } catch (err) {
                  console.error('bcrypt', err)

                  const pubErr = Error('hashing error')
                  pubErr.code = 500
                  pubErr.type = 'internal'

                  throw pubErr
                }

                try {
                  req.args.token = jwt.sign({
                    id: req.params.id,
                    pass: req.args.pass
                  }, TOKEN_SECRET)
                } catch (err) {
                  console.error('jwt', err)

                  const pubErr = Error('token encoding error')
                  pubErr.code = 500
                  pubErr.type = 'internal'

                  throw pubErr
                }
              }

              return req.db('users')
                .update(req.args)
                .where('id', req.params.id)
                .then(() => req.args.token || found.token)
                .catch((err) => {
                  console.error('db', err)

                  throw req.errors.database
                })
            } else {
              const err = Error('user not found')
              err.code = 404
              err.type = 'target'

              throw err
            }
          })
      },
      email: ({ address, subject, template, material }) => {
        let html

        try {
          html = ejs.render(template, material)
        } catch (err) {
          console.error('ejs', err)

          const pubErr = Error('email unable to render')
          pubErr.code = 500
          pubErr.type = 'internal'

          throw pubErr
        }

        return req.mailer.sendMail({
          from: 'Study Logic Worldwide HQ',
          to: address,
          envelope: {
            from: `Study Logic Worldwide HQ <${MAILER_USER}>`,
            to: `${material.name} <${address}>`
          },
          subject,
          html
        })
          .catch((err) => {
            console.error('mailer', err)

            const pubErr = Error('email unable to send')
            pubErr.code = 200
            pubErr.type = 'internal'

            throw pubErr
          })
      }
    }
  }

  next()
}
