const bcrypt = require('bcryptjs')

module.exports = function (rounds) {
  const salt = bcrypt.genSaltSync(rounds)

  return (req, res, next) => {
    req.salt = salt

    next()
  }
}
