const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
  TOKEN_SECRET
} = process.env

const requiredKeys = ['pass']

module.exports = function createUser (req, res) {
  if (req.params.id) {
    req.db('users')
      .select('name', 'email', 'token')
      .where({
        id: req.params.id
      })
        .catch(() => res.send(503, 'database unavailable'))
        .then(([row]) => {
          if (row) {
            if (row.token) res.send(400, 'user already created')
            else if (requiredKeys.every((key) => req.body.includes(key))) {
              bcrypt.hash(req.body.pass, req.salt, (err, hash) => {
                if (err) res.send(503, 'password encryption')
                else {
                  const token = jwt.sign({
                    id: req.params.id,
                    name: row.name,
                    email: row.email
                  }, TOKEN_SECRET)

                  req.db('users')
                    .update({
                      pass: hash,
                      token
                    })
                    .where({
                      id: req.params.id
                    })
                      .catch(() => res.send(503, 'database unavailable'))
                      .then(() => res.send(200))
                }
              })
            } else res.send(400, 'invalid body')
          } else res.send(400, 'invalid user')
        })
  } else res.send(res, 400, 'no id provided')
}
