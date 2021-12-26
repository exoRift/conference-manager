const bcrypt = require('bcrypt')

module.exports = function (rounds) {
  const salt = bcrypt.genSaltSync(rounds)

  return (req, res, next) => {
    req.salt = salt

    next()
  }
}
