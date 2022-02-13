module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    title: 'opt:string',
    content: 'opt:string'
  },
  options: {
    argtypes: {
      content: {
        maxStringLen: 500,
        allowNewlines: true
      }
    }
  },
  method: 'patch',
  route: '/post/:id',
  action: function (req, res) {
    if (req.auth.admin) {
      return req.db('posts')
        .update(req.args)
        .where('id', req.params.id)
        .then((updated) => {
          if (updated) {
            console.log('POST UPDATED:', req.auth.id, req.params.id)

            return res.send(200)
          } else return res.sendError(404, 'target', 'post does not exist')
        })
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
