module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    firstname: 'opt:string',
    lastname: 'opt:string',
    email: 'opt:string',
    pass: 'opt:string',
    tenant: 'opt:string',
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
      },
      pass: {
        maxStringLen: 40
      },
      tenant: {
        maxStringLen: 20,
        allowEmpty: true
      }
    }
  },
  method: 'patch',
  route: '/user/:id',
  action: function (req, res) {
    if (req.args.admin !== undefined && !req.auth.admin) return res.sendError(401, 'authorization', 'must be admin to alter admin status')

    if (req.auth.id === req.params.id || req.auth.admin) {
      return req.util.user.validate()
        .then(req.util.user.update)
        .then((token) => {
          console.log('USER UPDATED: ', req.auth.id, req.params.id)

          return res.send(200, token)
        })
        .catch((err) => res.sendError(err.code, err.type, err.message))
    } else return res.sendError(401, 'authorization', 'unauthorized to edit this user')
  }
}
