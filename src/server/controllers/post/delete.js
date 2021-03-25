module.exports = {
  requisites: ['authorize'],
  method: 'delete',
  route: '/post/:id/delete',
  action: function (req, res) {
    if (req.auth.admin) {
      return req.db('posts')
        .delete()
        .where('id', req.params.id)
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
        .then((amount) => {
          if (amount) {
            console.log('POST DELETED:', req.auth.id, req.params.id)

            return res.send(200)
          } else return res.sendError(404, 'target', 'post does not exist')
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
