module.exports = {
  requisites: ['authorize'],
  method: 'get',
  route: '/post/list/:limit?',
  action: function (req, res) {
    req.params.limit = isNaN(parseInt(req.params.limit)) ? 20 : parseInt(req.params.limit)

    return req.db('posts')
      .select()
      .limit(req.params.limit)
      .orderBy('timestamp', 'desc')
      .then((posts) => res.send(200, posts))
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
