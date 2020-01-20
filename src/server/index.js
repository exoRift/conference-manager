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
  conference,
  conferencesOf,
  room,
  roomCount,
  login,
  user,
  inviteUser,
  createUser,
  updateUser,
  updateConf,
  deleteConf,
  createConf
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
    name: 'opt:string',
    email: 'opt:string',
    pass: 'opt:string',
    admin: 'opt:boolean'
  },
  updateConf: {
    title: 'opt:string',
    room: 'opt:number',
    desc: 'opt:string',
    attendees: 'opt:array',
    starttime: 'opt:date',
    endtime: 'opt:date'
  },
  createConf: {
    title: 'string',
    room: 'number',
    desc: 'string',
    attendees: 'array',
    starttime: 'date',
    endtime: 'date'
  },
  createUser: {
    name: 'string',
    email: 'string'
  },
  registerUser: {
    name: 'string',
    email: 'string',
    pass: 'string'
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
app.get('/conference/:id', getConf, conference)
app.get('/conferencesOf/:id', conferencesOf)
app.get('/room/:room', room)
app.get('/roomCount', roomCount)
app.get('/user/:id/:prop', parseIdParam, authCheck, getUser, user)

app.post('/login', login)
app.post('/user/create', authCheck, typeDef(types.createUser), inviteUser)
app.post('/user/register/:id', parseIdParam, typeDef(types.registerUser), salter, createUser)
app.post('/user/:id/update', parseIdParam, authCheck, getUser, salter, typeDef(types.updateUser), updateUser)
app.post('/conference/:id/update', authCheck, getConf, typeDef(types.updateConf), updateConf)
app.post('/conference/delete/:id', authCheck, getConf, deleteConf)
app.post('/conference/create', authCheck, typeDef(types.createConf), createConf)

const {
  server
} = app.listen(API_PORT, () => {
  const {
    address,
    port
  } = server.address()

  console.log('API online listening at http://%s:%s', address, port)
})
