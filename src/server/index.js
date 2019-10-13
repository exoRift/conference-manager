require('dotenv').config()

const polka = require('polka')
const {
  json
} = require('body-parser')
const {
  database
} = require('./middleware/')
const cors = require('cors')

const tables = require('./config/tables.js')

const {
  directory,
  room,
  roomCount,
  login,
  user
} = require('./controllers/')

const {
  API_PORT,
  DATABASE_CLIENT,
  DATABASE_URL
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
  .use(database({
    client: DATABASE_CLIENT,
    connection: DATABASE_URL
  }, tables))

// Routes
app.get('/directory', directory)
app.get('/room/:room', room)
app.get('/roomCount', roomCount)
app.get('/user/:id/name', user.name)

app.post('/login', login)

app.listen(API_PORT)
