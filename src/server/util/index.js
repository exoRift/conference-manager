const {
  readdirSync,
  promises: {
    readFile
  }
} = require('fs')
const {
  join
} = require('path')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const ejs = require('ejs')

const {
  TOKEN_SECRET,
  MAX_TITLE_LENGTH,
  REACT_DOMAIN
} = process.env

const filenameRegex = /(.+?)\.js$/
const pathRegex = /.+\\(.+?)$/
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/ // eslint-disable-line

const dbError = Error('database unavailable')
dbError.code = 503

function requireDirToObject (path, notRoot) {
  const content = {}
  const files = readdirSync(path)

  for (const file of files) {
    if (file !== 'index.js' || notRoot) {
      if (file.includes('.')) content[file === 'index.js' ? path.match(pathRegex)[1] : file.match(filenameRegex)[1]] = require(join(path, file))
      else content[file] = requireDirToObject(join(path, file), true)
    }
  }

  return content
}

function updateUser (db, salt, user, data) {
  return verifyValidUser(db, data, user)
    .then((data) => db('users')
      .select('id')
      .where({
        id: user
      })
      .limit(1)
      .catch(() => {
        throw dbError
      })
      .then(([existing]) => {
        if (existing) {
          if (data.pass) {
            try {
              data.pass = bcrypt.hashSync(data.pass, salt)
            } catch {
              const err = Error('password hash')
              err.code = 503

              throw err
            }
          }

          let token
          try {
            token = jwt.sign({
              id: user,
              name: data.name || existing.name,
              email: data.email || existing.email,
              admin: data.admin || existing.admin
            }, TOKEN_SECRET)
          } catch {
            const err = Error('token encryption')
            err.code = 503

            throw err
          }

          return db('users')
            .update({
              ...data,
              token
            })
            .where({
              id: user
            })
            .catch(() => {
              throw dbError
            })
            .then(() => token)
        } else {
          const err = Error('invalid user')
          err.code = 400

          throw err
        }
      }))
}

function updateConf (db, user, conference, data) {
  return verifyValidConf(db, data)
    .then((data) => {
      if (Object.keys(data).length) {
        return db('confs')
          .select('id', 'creator')
          .where({
            id: conference
          })
          .limit(1)
          .catch(() => {
            throw dbError
          })
          .then(([row]) => {
            if (row) {
              if (user.id === row.creator || user.admin) {
                return db('confs')
                  .update(data)
                  .where({
                    id: conference
                  })
                  .catch(() => {
                    throw dbError
                  })
              } else {
                const err = Error('not conference owner')
                err.code = 401

                throw err
              }
            } else {
              const err = Error('invalid conference')
              err.code = 400

              throw err
            }
          })
      } else {
        const err = Error('empty object')
        err.code = 400

        throw err
      }
    })
}

function createConf (db, user, data) {
  return verifyValidConf(db, data)
    .then((data) => {
      if (Object.keys(data).length) {
        const confData = {
          attendees: [],
          ...data,
          id: String(Date.now()),
          creator: user.id
        }

        return db('confs')
          .insert(confData)
          .then(() => confData)
          .catch(() => {
            throw dbError
          })
      } else {
        const err = Error('empty object')
        err.code = 400

        throw err
      }
    })
}

function getUserProp (prop) {
  function parseBool (prop) {
    return typeof prop === 'boolean' ? String(prop) : prop
  }

  function userMap (user) {
    for (const prop in user) {
      user[prop] = parseBool(user[prop])
    }

    return user
  }

  return function (user) {
    if (prop === 'defining') {
      return {
        ...userMap(user),
        token: undefined,
        pass: undefined
      }
    } else return parseBool(user[prop])
  }
}

async function checkValidUsers (db, ids) {
  for (const id of ids) {
    db('users')
      .select('id')
      .where({
        id
      })
      .limit(1)
      .then(([row]) => {
        if (!row) {
          const err = Error('invalid user: ' + id)
          err.code = 400

          return err
        }
      })
      .catch(() => {
        throw dbError
      })
  }
}

async function verifyValidConf (db, data) {
  for (const param in data) {
    if ((typeof data[param] === 'string' && !data[param].length) || data[param] === undefined) delete data[param]
  }

  if (data.name) data.name = data.name.trim()
  if (data.attendees) data.attendees = JSON.stringify(data.attendees)
  else data.attendees = '[]'
  if (data.tile && data.title.length > MAX_TITLE_LENGTH) {
    const err = Error('title too long')
    err.code = 400

    throw err
  }

  const start = new Date(data.starttime).getTime()
  const startString = new Date(data.starttime).toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
  })
  const end = new Date(data.endtime).getTime()
  const endString = new Date(data.endtime).toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
  })

  if (start < Date.now()) {
    const err = Error('start date cannot be earlier than current date')
    err.code = 400

    throw err
  }

  if (end <= start) {
    const err = Error('end date cannot be earlier than or equal to the start date')
    err.code = 400

    throw err
  }

  if (end - start > 7200000) {
    const err = Error('conference can not be longer than 2 hours')
    err.code = 400

    throw err
  }

  if (end - start < 900000) {
    const err = Error('conference must be at least 15 minutes')
    err.code = 400

    throw err
  }

  return db('confs')
    .select('title', 'starttime', 'endtime')
    .where(
      db.raw(`(room = ${data.room}) AND (('${startString}'::date > starttime AND '${startString}'::date < endtime) OR ('${endString}'::date > starttime AND '${endString}'::date < endtime))`)
    )
    .limit(1)
    .catch(() => {
      throw dbError
    })
    .then(([overlap]) => {
      if (overlap) {
        const err = Error(`conference overlaps existing conference: ${overlap.title} which is in session from ${startString} to ${endString}`)
        err.code = 400

        throw err
      } else return data
    })
}

function createUser (db, mailer, executor, { name, email }) {
  return verifyValidUser(db, { name, email })
    .then(({ name, email }) => {
      const id = String(Date.now())

      return readFile('src/server/templates/invite.ejs', { encoding: 'utf8' })
        .then((temp) => emailUser(mailer, email, {
          subject: `You've been invited by ${executor} to create an account for the 525 Chestnut office building`,
          temp,
          tempData: {
            name,
            executor,
            link: `${REACT_DOMAIN}/register/${id}?name=${name}&email=${email}`
          }
        }))
        .then(() => db('users')
          .insert({
            id,
            name,
            email
          })
          .catch(() => {
            throw dbError
          }))
        .then(() => id)
    })
}

async function emailUser (mailer, email, { subject, temp, tempData }) {
  let html

  try {
    html = ejs.render(temp, tempData)
  } catch (e) {
    const err = Error('email template compilation')
    err.code = 503

    throw err
  }

  return mailer.sendMail({
    from: 'Study Logic',
    to: email,
    subject,
    html
  })
    .catch(() => {
      const err = Error('mailing engine unavailable')
      err.code = 503

      throw err
    })
}

async function verifyValidUser (db, user, exclude) {
  let {
    name,
    email
  } = user
  email = email.toLowerCase()

  if (name && name.match(emailRegex)) {
    const err = Error('name cannot be email format')
    err.code = 400

    throw err
  }

  if (email.match(emailRegex)) {
    return db('users')
      .select('id')
      .where(
        db.raw('id != ? AND (LOWER("name") = ? OR email = ?)', [exclude || '', name.toLowerCase(), email])
      )
      .limit(1)
      .catch(() => {
        throw dbError
      })
      .then(([res]) => {
        if (res) {
          const err = Error('user with name or email already exists')
          err.code = 400

          throw err
        }

        return {
          ...user,
          email
        }
      })
  } else {
    const err = Error('invalid email provided')
    err.code = 400

    throw err
  }
}

function deleteUser (db, mailer, id, executor) {
  return db('users')
    .select('name', 'email', 'token')
    .where({
      id
    })
    .limit(1)
    .catch(() => {
      throw dbError
    })
    .then(([user]) => {
      if (user) {
        return db('users')
          .delete()
          .where({
            id
          })
          .catch(() => {
            throw dbError
          })
          .then(() => readFile(`src/server/templates/${user.token ? 'deleted' : 'canceled'}.ejs`, { encoding: 'utf8' }))
          .then((temp) => emailUser(mailer, user.email, {
            subject: user.token ? 'Account deleted by ' + executor : 'Account registration expired',
            temp,
            tempData: {
              executor
            }
          }))
          .catch(() => {
            const err = Error('user deleted but email failed to send')
            err.code = 503

            throw err
          })
          .then(() => user.token ? 'deleted' : 'canceled')
      } else {
        const err = Error('invalid user')
        err.code = 400

        throw err
      }
    })
}

module.exports = {
  requireDirToObject,
  updateUser,
  updateConf,
  createConf,
  getUserProp,
  checkValidUsers,
  verifyValidConf,
  createUser,
  emailUser,
  verifyValidUser,
  deleteUser
}
