const polka = require('polka')
const path = require('path')
const {
  json
} = require('body-parser')
const cors = require('cors')

const {
  database,
  errortemplates,
  genSalt,
  mailer,
  meetingcore: {
    core: meetingcore,
    middleware: meetingcoreMW
  },
  sendError,
  typesender,
  utilities
} = require('./middleware/')
const modules = require('./modules/')
const controllers = require('./controllers/')

const {
  API_PORT,
  MAILER_HOST,
  MAILER_PORT,
  MAILER_USER,
  MAILER_PASS,
  SALT_ROUNDS
} = process.env

const app = polka()

app
  .use(cors()) // CORS policy compliance
  // Utility
  .use(json())
  .use(utilities)
  // Middleware
  .use(database(require(path.join(process.cwd(), 'knexfile.js')), meetingcore))
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
  .use(meetingcoreMW)
  .use(sendError)
  .use(typesender)

// Routes
for (const controller of controllers) {
  const layers = controller.requisites.reduce((a, r) => a.concat(modules[r](controller)), [])

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
