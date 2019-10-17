const nodeMailer = require('nodemailer')

module.exports = function mailer (options) {
  const transporter = nodeMailer.createTransport(options)

  return async (req, res, next) => {
    req.mailer = transporter

    next()
  }
}
