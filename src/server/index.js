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
  parseIDParam,
  typeDef,
  getConf
} = require('./modules/')

const tables = require('./config/tables.js')

const {
  conference,
  room,
  user
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
  login: {
    iden: 'string',
    pass: 'string'
  },
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
    attendees: 'opt:array',
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
app.get('/conference/:id', getConf, conference.conference)
app.get('/conference/list/:id', conference.list)
app.get('/room/count', room.count)
app.get('/room/:room', room.room)
app.get('/user/:id/name', parseIDParam, getUser, user.user)
app.get('/user/:id/:prop', authCheck, parseIDParam, getUser, user.user)

app.post('/conference/create', authCheck, typeDef(types.createConf), conference.create)
app.post('/conference/delete/:id', authCheck, getConf, conference.delete)
app.post('/conference/:id/update', authCheck, getConf, typeDef(types.updateConf), conference.update)
app.post('/user/create', authCheck, typeDef(types.createUser), user.create)
app.post('/user/:id/delete', authCheck, parseIDParam, getUser, user.delete)
app.post('/user/login', typeDef(types.login), user.login)
app.post('/user/register/:id', parseIDParam, typeDef(types.registerUser), salter, user.register)
app.post('/user/:id/update', authCheck, parseIDParam, getUser, salter, typeDef(types.updateUser), user.update)

const {
  server
} = app.listen(API_PORT, () => {
  const {
    address,
    port
  } = server.address()

  console.log('API online listening at http://%s:%s', address, port)
})
