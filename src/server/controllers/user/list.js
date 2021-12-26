module.exports = {
  requisites: ['authorize'],
  method: 'get',
  route: '/user/list',
  action: function (req, res) {
    if (req.auth.admin) {
      return req.db('users')
        .select('id')
        .then((users) => res.send(200, users))
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
