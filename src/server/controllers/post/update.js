module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    title: 'opt:string',
    content: 'opt:string'
  },
  method: 'patch',
  route: '/post/:id/update',
  action: function (req, res) {
    if (req.auth.admin) {
      return req.db('meetings')
        .select()
        .where('id', req.params.id)
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
        .then(([found]) => {
          if (found) {
            return req.db('posts')
              .update(req.args)
              .where('id', req.params.id)
              .catch((err) => {
                console.error('db', err)

                return res.sendError(500, 'internal', 'database unavailable')
              })
              .then(() => {
                console.log('POST UPDATED:', req.auth.id, req.params.id)

                return res.send(200)
              })
          } else return res.sendError(404, 'target', 'post does not exist')
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
