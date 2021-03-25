module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    firstname: 'opt:string',
    lastname: 'opt:string',
    pass: 'opt:string',
    email: 'opt:string',
    admin: 'opt:boolean'
  },
  method: 'patch',
  route: '/user/:id/update',
  action: function (req, res) {
    if (req.args.admin !== undefined && !req.auth.admin) return res.sendError(401, 'authorization', 'must be admin to alter admin status')

    if (req.auth.id === req.params.id || req.auth.admin) {
      return req.util.user.update()
        .catch((err) => res.sendError(err.code, err.type, err.message))
        .then((token) => {
          console.log('USER UPDATED: ', req.auth.id, req.params.id)

          return res.send(200, token)
        })
    } else return res.sendError(401, 'authorization', 'unauthorized to edit this user')
  }
}
