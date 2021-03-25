module.exports = {
  requisites: [],
  method: 'get',
  route: '/post/list',
  action: function (req, res) {
    return req.db('posts')
      .select()
      .limit(20)
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
      .then((posts) => res.send(200, posts))
  }
}
