module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    title: 'string',
    content: 'string'
  },
  method: 'post',
  route: '/post/create',
  action: function (req, res) {
    if (req.auth.admin) {
      const id = String(Date.now())

      return req.db('posts')
        .insert({
          id,
          timestamp: new Date(),
          ...req.args
        })
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
        .then(() => {
          console.log('POST CREATED:', req.auth.id, id)

          return res.send(200, id)
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
