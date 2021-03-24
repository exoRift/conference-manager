const {
  toArray
} = require('mass-require')

module.exports = toArray(__dirname, {
  recursive: true,
  flatten: true,
  exclude: /^index\.js$/
})
