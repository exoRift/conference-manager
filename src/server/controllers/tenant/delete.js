module.exports = {
  requisites: ['authorize'],
  method: 'delete',
  route: '/tenant/:suite',
  action: function (req, res) {
    if (req.auth.admin) {
      return req.db('users')
        .delete()
        .where('suite', req.params.suite)
        .then(() => {
          console.log('TENANT DELETED: ', req.auth.id, req.params.suite)

          return res.send(200)
        })
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
