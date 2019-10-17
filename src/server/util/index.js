const {
  readdirSync
} = require('fs')
const {
  join
} = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
  TOKEN_SECRET
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

function updateUser (db, salt, user, data) {
  return db('users')
    .select()
    .where({
      id: user
    })
      .then(([row]) => {
        if (row) {
          if (data.pass) {
            try {
              data.pass = bcrypt.hashSync(data.pass, salt)
            } catch (err) {
              throw Error('password hash')
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
            throw Error('token encryption')
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
                throw Error('database unavailable')
              })
        } else throw Error('invalid user')
      })
}

module.exports = {
  requireDirToObject,
  updateUser
}
