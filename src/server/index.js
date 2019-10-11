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

const routes = require('./routes/')

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
for (const route of routes) {
  if (route.type === 'post') app.post(route.path, route.action)
  else app.get(route.path, route.action)
}

app.listen(API_PORT)
