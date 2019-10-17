require('dotenv').config()

const polka = require('polka')
const {
  json
} = require('body-parser')
const cors = require('cors')
const {
  database,
  mailer,
  sender
} = require('./middleware/')
const {
  authCheck,
  getUser,
  saltGen,
  parseIdParam
} = require('./modules/')

const tables = require('./config/tables.js')

const {
  directory,
  room,
  roomCount,
  login,
  user,
  inviteUser,
  createUser,
  updateUser
} = require('./controllers/')

const {
  API_PORT,
  DATABASE_CLIENT,
  DATABASE_URL,
  MAILER_HOST,
  MAILER_PORT,
  MAILER_USER,
  MAILER_PASS,
  SALT_ROUNDS
} = process.env

const app = polka()

// Util
app
  .use(json())

// Auths
app
  .use(cors())

// Middleware
app
  .use(sender)
  .use(database({
    client: DATABASE_CLIENT,
    connection: DATABASE_URL
  }, tables))
  .use(mailer({
    host: MAILER_HOST,
    port: MAILER_PORT,
    auth: {
      user: MAILER_USER,
      pass: MAILER_PASS
    }
  }))

const salter = saltGen(parseInt(SALT_ROUNDS))

// Routes
app.get('/directory', directory)
app.get('/room/:room', room)
app.get('/roomCount', roomCount)
app.get('/user/:id/:prop', parseIdParam, authCheck, getUser, user)

app.post('/login', login)
app.post('/inviteUser', parseIdParam, authCheck, inviteUser)
app.post('/createUser/:id', parseIdParam, authCheck, salter, createUser)
app.post('/user/:id/update', parseIdParam, authCheck, getUser, salter, updateUser)

const {
  server
} = app.listen(API_PORT, () => {
  const {
    address,
    port
  } = server.address()

  console.log('API online listening at http://%s:%s', address, port)
})
