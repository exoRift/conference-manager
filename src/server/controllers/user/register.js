module.exports = {
  requisites: ['argtypes'],
  args: {
    firstname: 'opt:string',
    lastname: 'opt:string',
    pass: 'string',
    email: 'opt:string'
  },
  method: 'patch',
  route: '/user/register/:id',
  action: function (req, res) {
    return req.util.user.update()
      .catch((err) => {
        if (err.code === 404) err.message = 'prototype not found'

        return res.sendError(err.code, err.type, err.message)
      })
      .then((token) => res.send(200, token))
  }
}
