const mailer = require('nodemailer')

module.exports = function (options) {
  const transporter = mailer.createTransport(options)

  transporter.verify((err, success) => {
    if (success) console.info('Mail engine online')
    else console.error('MAIL ENGINE FAILURE:', err)
  })

  return (req, res, next) => {
    req.mailer = transporter

    next()
  }
}
