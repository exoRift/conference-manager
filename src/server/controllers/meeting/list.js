module.exports = {
  requisites: [],
  method: 'get',
  route: '/meeting/list/:id',
  action: function (req, res) {
    return req.db('meetings')
      .select()
      .where('creator', req.params.id)
      .catch((err) => {
        console.error('db', err)

        res.sendError(500, 'internal', 'database unavailable')
      })
      .then((meetings) => {
        res.send(200, meetings)
      })
  }
}
