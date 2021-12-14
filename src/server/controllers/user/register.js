module.exports = {
  requisites: ['argtypes'],
  args: {
    firstname: 'opt:string',
    lastname: 'opt:string',
    email: 'opt:string',
    pass: 'string',
    entity: 'opt:string'
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
      },
      pass: {
        maxStringLen: 40
      },
      entity: {
        maxStringLen: 20,
        allowEmpty: true
      }
    }
  },
  method: 'patch',
  route: '/user/:id/register',
  action: function (req, res) {
    return req.db.raw('SELECT EXISTS (SELECT 1 FROM users WHERE id = ? AND token IS NOT NULL)', [req.params.id])
      .then(({ rows: [{ exists }] }) => {
        if (exists) return res.sendError(409, 'target', 'user already registered')
        else {
          return req.util.user.validate(req.params.id)
            .then(req.util.user.update)
            .then((token) => res.send(200, token))
            .catch((err) => {
              if (err.code === 404) err.message = 'prototype not found'

              return res.sendError(err.code, err.type, err.message)
            })
        }
      })
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
