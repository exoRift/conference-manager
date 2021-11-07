module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    title: 'string',
    content: 'string'
  },
  options: {
    argtypes: {
      content: {
        allowNewlines: true
      }
    }
  },
  method: 'post',
  route: '/post',
  action: function (req, res) {
    if (req.auth.admin) {
      const id = String(Date.now())

      return req.db('posts')
        .insert({
          id,
          timestamp: new Date(),
          creator: req.auth.id,
          ...req.args
        })
        .then(() => {
          console.log('POST CREATED:', req.auth.id, id)

          return res.send(200, id)
        })
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
