const {
  promises: {
    readFile
  }
} = require('fs')

const {
  REACT_DOMAIN
} = process.env

module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    firstname: 'string',
    lastname: 'string',
    email: 'string',
    admin: 'boolean'
  },
  method: 'post',
  route: '/user/create',
  action: function (req, res) {
    if (req.auth.admin) {
      return req.util.user.validate()
        .catch((err) => res.sendError(err.code, err.type, err.message))
        .then(() => {
          const id = String(Date.now())

          return req.db('users')
            .insert({
              id,
              firstname: req.args.firstname,
              lastname: req.args.lastname,
              email: req.args.email,
              admin: req.args.admin
            })
            .catch((err) => {
              console.error('db', err)

              return res.sendError(500, 'internal', 'database unavailable')
            })
            .then(() => {
              console.log('USER CREATED: ', req.auth.id, id)

              return readFile('src/server/templates/invited.ejs', { encoding: 'utf8' })
                .then((temp) => req.util.user.email({
                  subject: `You've been invited by ${req.auth.firstname} ${req.auth.lastname} to create an account for the 525 Chestnut office building`,
                  temp,
                  material: {
                    name: `${req.args.firstname} ${req.args.lastname}`,
                    executor: `${req.auth.firstname} ${req.auth.lastname}`,
                    link: `${REACT_DOMAIN}/register/${id}?firstname=${req.args.firstname}&lastname=${req.args.lastname}&email=${req.args.email}`
                  }
                }))
                .catch((err) => res.sendError(err.code, err.type, err.message))
                .then(() => {
                  setTimeout(() => {
                    return req.db('users')
                      .select('token')
                      .where('id', id)
                      .catch((err) => console.error('db', err))
                      .then(([{ token }]) => {
                        if (!token) {
                          return req.db('users')
                            .delete()
                            .where('id', id)
                            .catch((err) => console.error('db', err))
                            .then(() => {
                              console.log('USER CREATION EXPIRED: ', id)

                              return readFile('src/server/templates/cancelled.ejs', { encoding: 'utf8' })
                                .then((temp) => req.util.user.email({
                                  subject: 'Account registration expired',
                                  temp,
                                  material: {
                                    name: `${req.args.firstname} ${req.args.lastname}`,
                                    executor: `${req.auth.firstname} ${req.auth.lastname}`
                                  }
                                }))
                                .catch((ignore) => ignore)
                            })
                        }
                      })
                  }, 604800000 /* 1 week */)

                  return res.send(200, id)
                })
            })
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
