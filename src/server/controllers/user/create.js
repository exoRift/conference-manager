const {
  promises: {
    readFile
  }
} = require('fs')

const {
  FRONTEND_DOMAIN
} = process.env

module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    firstname: 'string',
    lastname: 'string',
    email: 'string',
    admin: 'opt:boolean'
  },
  options: {
    argtypes: {
      firstname: {
        maxStringLen: 20
      },
      lastname: {
        maxStringLen: 20
      },
      email: {
        maxStringLen: 40
      }
    }
  },
  method: 'post',
  route: '/user',
  action: function (req, res) {
    if (req.auth.admin) {
      return req.util.user.validate()
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
            .then(() => {
              console.log('USER CREATED: ', req.auth.id, id)

              return readFile('src/server/templates/invited.ejs', { encoding: 'utf8' })
                .then((template) => req.util.user.email({
                  address: req.args.email,
                  subject: `You've been invited by ${req.auth.firstname} ${req.auth.lastname} to create an account for the 525 Chestnut office building`,
                  template,
                  material: {
                    name: `${req.args.firstname} ${req.args.lastname}`,
                    executor: `${req.auth.firstname} ${req.auth.lastname}`,
                    link: `${FRONTEND_DOMAIN}/register/${id}?firstname=${req.args.firstname}&lastname=${req.args.lastname}&email=${req.args.email}`
                  }
                }))
                .then(() => {
                  setTimeout(() => {
                    return req.db('users')
                      .select(req.db.raw('CASE WHEN token IS NULL THEN true ELSE false END as partial'))
                      .where('id', id)
                      .then(([{ partial }]) => {
                        if (partial) {
                          return req.db('users')
                            .delete()
                            .where('id', id)
                            .then(() => {
                              console.log('USER CREATION EXPIRED: ', id)

                              return readFile('src/server/templates/canceled.ejs', { encoding: 'utf8' })
                                .then((template) => req.util.user.email({
                                  address: req.args.email,
                                  subject: 'Account registration expired',
                                  template,
                                  material: {
                                    name: `${req.args.firstname} ${req.args.lastname}`,
                                    executor: `${req.auth.firstname} ${req.auth.lastname}`
                                  }
                                }))
                                .catch((ignore) => ignore) // Error already logged
                            })
                            .catch((err) => console.error('db', err))
                        }
                      })
                      .catch((err) => console.error('db', err))
                  }, 604800000 /* 1 week */)

                  return res.send(200, id)
                })
                .catch((err) => res.sendError(206, err.type, 'user created but ' + err.message, { id }))
            })
            .catch((err) => {
              console.error('db', err)

              return res.sendError(500, 'internal', 'database unavailable')
            })
        })
        .catch((err) => res.sendError(err.code, err.type, err.message))
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
