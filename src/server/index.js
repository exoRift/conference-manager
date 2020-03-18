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
  getAnnouncement,
  getConf,
  getUser,
  parseIDParam,
  saltGen,
  typeDef
} = require('./modules/')

const tables = require('./config/tables.js')

const {
  announcement,
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
  announcement: {
    create: {
      title: 'string',
      content: 'string'
    },
    update: {
      title: 'string',
      content: 'string'
    }
  },
  conference: {
    create: {
      title: 'string',
      room: 'number',
      desc: 'string',
      attendees: 'opt:array',
      starttime: 'date',
      endtime: 'date'
    },
    update: {
      title: 'opt:string',
      room: 'opt:number',
      desc: 'opt:string',
      attendees: 'opt:array',
      starttime: 'opt:date',
      endtime: 'opt:date'
    }
  },
  user: {
    create: {
      name: 'string',
      email: 'string'
    },
    login: {
      iden: 'string',
      pass: 'string'
    },
    register: {
      name: 'string',
      email: 'string',
      pass: 'string'
    },
    update: {
      name: 'opt:string',
      email: 'opt:string',
      pass: 'opt:string',
      admin: 'opt:boolean'
    }
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
app.get('/announcement/:id/', getAnnouncement, announcement.announcement)
app.get('/conference/:id', getConf, conference.conference)
app.get('/conference/list/:id', conference.list)
app.get('/room/count', room.count)
app.get('/room/:room', room.room)
app.get('/user/:id/name', parseIDParam, getUser, user.user)
app.get('/user/:id/:prop', authCheck, parseIDParam, getUser, user.user)

app.post('/announcement/create', authCheck, typeDef(types.announcement.create), announcement.create)
app.post('/announcement/:id/delete', authCheck, getAnnouncement, announcement.delete)
app.post('/announcement/:id/update', authCheck, getAnnouncement, typeDef(types.announcement.update), announcement.update)
app.post('/conference/create', authCheck, typeDef(types.conference.create), conference.create)
app.post('/conference/:id/delete', authCheck, getConf, conference.delete)
app.post('/conference/:id/update', authCheck, getConf, typeDef(types.conference.update), conference.update)
app.post('/user/create', authCheck, typeDef(types.user.create), user.create)
app.post('/user/:id/delete', authCheck, parseIDParam, getUser, user.delete)
app.post('/user/login', typeDef(types.user.login), user.login)
app.post('/user/register/:id', parseIDParam, typeDef(types.user.register), salter, user.register)
app.post('/user/:id/update', authCheck, parseIDParam, getUser, salter, typeDef(types.user.update), user.update)

const {
  server
} = app.listen(API_PORT, () => {
  const {
    address,
    port
  } = server.address()

  console.log('API online listening at http://%s:%s', address, port)
})
