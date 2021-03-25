const bcrypt = require('bcrypt')

module.exports = {
  requisites: ['argtypes'],
  args: {
    email: 'string',
    pass: 'string'
  },
  method: 'post',
  route: '/user/login',
  action: function (req, res) {
    return req.db('users')
      .select('pass', 'token')
      .where(
        req.db.raw('LOWER("email") = ?', req.body.email.toLowerCase())
      )
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
      .then(([found]) => {
        if (found) {
          bcrypt.compare(req.args.pass, found.pass, (err, match) => {
            if (err) {
              console.error('bcrypt', err)

              return res.sendError(500, 'internal', 'could not verify password')
            }

            if (match) return res.send(200, found.token)
            else return res.send(400, 'invalid password')
          })
        } else return res.send(404, 'target', 'user not found')
      })
  }
}
