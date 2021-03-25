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

              res.send(200, id)

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
                        .then(() => console.log('USER CREATION EXPIRED: ', id))
                    }
                  })
              }, 604800000 /* 1 week */)
            })
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
