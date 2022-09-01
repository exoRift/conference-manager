const Knex = require('knex')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
  SALT_ROUNDS,
  TOKEN_SECRET,
  SYSADMIN_PASS
} = process.env

const salt = bcrypt.genSaltSync(parseInt(SALT_ROUNDS))
const db = new Knex(require(path.join(process.cwd(), 'knexfile.js')))

const users = [
  {
    firstname: 'SYSTEM',
    lastname: 'ADMINISTRATOR',
    email: 'sys@admin'
  },
  {
    firstname: 'CR',
    lastname: 'PANEL',
    email: 'cr@panel'
  }
]

bcrypt.hash(SYSADMIN_PASS, salt, (err, pass) => {
  if (err) throw err

  const requests = []

  for (const user of users) {
    const id = String(Date.now())

    const token = jwt.sign({
      id,
      pass
    }, TOKEN_SECRET)

    requests.push(db('users')
      .insert({
        id,
        pass,
        token,
        ...user
      })
      .then(() => console.info(`${user.firstname} ${user.lastname} created`))
      .catch((err) => {
        console.error(`${user.firstname} ${user.lastname} not created`, err)

        process.exit(1)
      }))
  }

  Promise.all(requests).then(() => process.exit())
})
