const ejs = require('ejs')

const {
  REACT_DOMAIN
} = process.env

const requiredKeys = ['name', 'email']

module.exports = function createUser (req, res) {
  if (req.auth) {
    if (requiredKeys.every((key) => req.body.includes(key))) {
      const id = String(Date.now())

      req.db('users')
        .insert({
          id,
          name: req.body.name,
          email: req.body.email
        })
          .catch(() => res.send(503, 'database unavailable'))
          .then(() => {
            ejs.renderFile('../templates/email.ejs', {
              name: req.body.name,
              link: REACT_DOMAIN + '/createUser/' + id
            }, (err, html) => {
              if (err) res.send(503, 'email template compilation')
              else {
                req.mailer.sendMail({
                  from: 'Study Logic',
                  to: req.body.email,
                  subject: `You've been invited by ${row.name} to create an account for the 525 Chestnut office building`,
                  html
                })
                  .catch(() => res.send(503, 'database unavailable'))
                  .then(() => res.send(200))
              }
            })
          })
    } else res.send(400, 'invalid body')
  } else res.send(401)
}
