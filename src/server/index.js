const polka = require('polka')
const {
  json
} = require('body-parser')
const cors = require('cors')

const {
  database,
  errortemplates,
  genSalt,
  mailer,
  sendError,
  typesender,
  utilities
} = require('./middleware/')
const modules = require('./modules/')
const controllers = require('./controllers/')

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

app
  // Utility
  .use(json())
  .use(utilities)
  .use(cors()) // CORS policy compliance
  // Middleware
  .use(database({
    client: DATABASE_CLIENT,
    connection: DATABASE_URL
  }))
  .use(errortemplates)
  .use(genSalt(parseInt(SALT_ROUNDS)))
  .use(mailer({
    host: MAILER_HOST,
    port: MAILER_PORT,
    auth: {
      user: MAILER_USER,
      pass: MAILER_PASS
    }
  }))
  .use(sendError)
  .use(typesender)

// Routes
for (const controller of controllers) {
  console.log(controller)
  const layers = controller.requisites.reduce((a, r) => a.concat(modules[r.name](r.params)), [])

  app[controller.method](controller.route, ...layers, controller.action)
}

const {
  server
} = app.listen(API_PORT, () => {
  const {
    address,
    port
  } = server.address()

  console.info('API online listening at http://%s:%s', address, port)
})
