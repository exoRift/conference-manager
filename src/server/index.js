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
  parseIdParam,
  typeDef,
  getConf
} = require('./modules/')

const tables = require('./config/tables.js')

const {
  conf,
  room,
  roomCount,
  login,
  user,
  inviteUser,
  createUser,
  updateUser,
  updateConf
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

const types = {
  updateUser: {
    name: 'string',
    email: 'string',
    pass: 'string',
    admin: 'boolean'
  },
  updateConf: {
    title: 'string',
    room: ['number'],
    desc: 'string',
    attendees: 'array',
    starttime: 'date',
    endtime: 'date'
  }
}

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
app.get('/conference/:id', getConf, conf)
app.get('/room/:room', room)
app.get('/roomCount', roomCount)
app.get('/user/:id/:prop', parseIdParam, authCheck, getUser, user)

app.post('/login', login)
app.post('/inviteUser', parseIdParam, authCheck, inviteUser)
app.post('/createUser/:id', parseIdParam, authCheck, salter, createUser)
app.post('/user/:id/update', parseIdParam, authCheck, getUser, salter, typeDef(types.updateUser), updateUser)
app.post('/conference/:id/update', authCheck, getConf, typeDef(types.updateConf), updateConf)

const {
  server
} = app.listen(API_PORT, () => {
  const {
    address,
    port
  } = server.address()

  console.log('API online listening at http://%s:%s', address, port)
})
