require('dotenv').config()

const polka = require('polka')
const {
  database
} = require('./middleware/')
const cors = require('cors')

const tables = require('./config/database.json')

const routes = require('./routes/')

const {
  API_PORT,
  DATABASE_CLIENT,
  DATABASE_URL
} = process.env

const app = polka()

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
