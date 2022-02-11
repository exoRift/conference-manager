const https = require('https')
const polka = require('polka')
const serve = require('sirv')
const fs = require('fs')
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
  NODE_ENV,
  PORT,
  MAILER_HOST,
  MAILER_PORT,
  MAILER_USER,
  MAILER_PASS,
  SALT_ROUNDS,
  SSL_CRT_FILE,
  SSL_KEY_FILE
} = process.env

const ssl = {
  cert: fs.readFileSync(SSL_CRT_FILE),
  key: fs.readFileSync(SSL_KEY_FILE)
}

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

  app[controller.method]('/api' + controller.route, ...layers, controller.action)
}

if (NODE_ENV !== 'development') {
  app.use(serve('build'))

  console.info('Frontend mounted')
}

const server = https.createServer(ssl, app.handler).listen(PORT, () => {
  const {
    address,
    port
  } = server.address()

  console.info('Server online listening at https://%s:%s', address, port)
})
