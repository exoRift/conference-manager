const path = require('path')

const {
  DATABASE_CLIENT,
  DATABASE_URL
} = process.env

module.exports = {
  client: DATABASE_CLIENT,
  connection: DATABASE_URL,
  migrations: {
    directory: path.join(__dirname, 'db/migrations')
  }
}
