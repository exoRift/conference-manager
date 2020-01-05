const {
  readdirSync
} = require('fs')
const {
  join
} = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
  TOKEN_SECRET,
  MAX_TITLE_LENGTH
} = process.env

const filenameRegex = /(.+?)\.js$/

function requireDirToObject (path) {
  const content = {}
  const files = readdirSync(path)

  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'index.js') content[files[i].match(filenameRegex)[1]] = require(join(path, files[i]))
  }

  return content
}

async function updateUser (db, salt, user, data) {
  for (const param in data) {
    if ((typeof data[param] === 'string' && !data[param].length) || data[param] === undefined) delete data[param]
  }

  if (Object.keys(data).length) {
    return db('users')
      .select()
      .where({
        id: user
      })
      .limit(1)
      .then(([row]) => {
        if (row) {
          if (data.pass) {
            try {
              data.pass = bcrypt.hashSync(data.pass, salt)
            } catch (err) {
              const error = Error('password hash')
              error.code = 503

              throw error
            }
          }

          let token
          try {
            token = jwt.sign({
              id: user,
              name: data.name || row.name,
              email: data.email || row.email,
              admin: data.admin || row.admin
            }, TOKEN_SECRET)
          } catch (err) {
            const error = Error('token encryption')
            error.code = 503

            throw error
          }

          return db('users')
            .update({
              ...data,
              token
            })
            .where({
              id: user
            })
            .then(() => token)
        } else {
          const err = Error('invalid user')
          err.code = 400

          throw err
        }
      })
      .catch(() => {
        const err = Error('database unavailable')
        err.code = 503

        throw err
      })
  } else {
    const err = Error('empty object')
    err.code = 400

    throw err
  }
}

async function updateConf (db, user, conference, data) {
  return verifyValidConf(data)
    .then((data) => {
      if (Object.keys(data).length) {
        return db('confs')
          .select('id', 'creator')
          .where({
            id: conference
          })
          .limit(1)
          .catch(() => {
            const err = Error('database unavailable')
            err.code = 503

            throw err
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
                    const err = Error('database unavailable')
                    err.code = 503

                    throw err
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

async function createConf (db, user, data) {
  return verifyValidConf(data)
    .then((data) => {
      if (Object.keys(data).length) {
        const confData = {
          ...data,
          id: String(Date.now()),
          creator: user.id
        }

        return db('confs')
          .insert(confData)
          .then(() => confData)
          .catch(() => {
            const err = Error('database unavailable')
            err.code = 503

            throw err
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
        const err = Error('database unavailable')
        err.code = 503

        return err
      })
  }
}

async function verifyValidConf (data) {
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

  if (new Date(data.starttime).getTime() < Date.now()) {
    const err = Error('start date cannot be earlier than current date')
    err.code = 400

    throw err
  }

  if (new Date(data.endtime).getTime() <= new Date(data.starttime).getTime()) {
    const err = Error('end date cannot be earlier than or equal to the start date')
    err.code = 400

    throw err
  }

  return data
}

module.exports = {
  requireDirToObject,
  updateUser,
  updateConf,
  createConf,
  getUserProp,
  checkValidUsers
}
