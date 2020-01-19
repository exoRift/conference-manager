const nodeMailer = require('nodemailer')

module.exports = function mailer (options) {
  const transporter = nodeMailer.createTransport(options)

  transporter.verify((err, success) => {
    if (success) console.log('Mail engine online')
    else console.error('MAIL ENGINE FAILURE: ' + err)
  })

  return async (req, res, next) => {
    req.mailer = transporter

    next()
  }
}
