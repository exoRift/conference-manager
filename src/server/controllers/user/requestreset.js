const {
  promises: {
    readFile
  }
} = require('fs')
const jwt = require('jsonwebtoken')

const {
  FRONTEND_DOMAIN,
  RESET_SECRET
} = process.env

module.exports = {
  requisites: ['argtypes'],
  args: {
    email: 'string'
  },
  method: 'post',
  route: '/user/requestreset',
  action: function (req, res) {
    return req.db('users')
      .select('id', 'firstname', 'lastname')
      .where('email', req.args.email)
      .limit(1)
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
      .then(([user]) => {
        if (user) {
          try {
            const token = jwt.sign({
              id: user.id,
              timestamp: Date.now()
            }, RESET_SECRET)

            console.log('PASSWORD RESET REQUESTED FOR, BY:', user.id, req.connection.remoteAddress)

            return readFile('src/server/templates/reset.ejs', { encoding: 'utf8' })
              .then((template) => req.util.user.email({
                address: req.args.email,
                subject: 'Password Reset Requested',
                template,
                material: {
                  name: `${user.firstname} ${user.lastname}`,
                  ip: req.connection.remoteAddress,
                  link: `${FRONTEND_DOMAIN}/reset/${user.id}?firstname=${user.firstname}&lastname=${user.lastname}&email=${req.args.email}&token=${token}` // eslint-disable-line
                }
              }))
              .then(() => res.send(200))
          } catch (err) {
            console.error('jwt', err)

            return res.sendError(500, 'internal', 'token encoding error')
          }
        } else return res.sendError(404, 'target', 'user not found')
      })
  }
}
