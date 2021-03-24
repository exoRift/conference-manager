module.exports = {
  requisites: ['authorize'],
  method: 'delete',
  route: '/meeting/delete',
  action: function (req, res) {
    return req.db('meetings')
      .delete()
      .where('id', req.params.id)
      .catch((err) => {
        console.error('db', err)

        res.sendError(500, 'internal', 'database unavailable')
      })
      .then((amount) => {
        if (amount) {
          console.log('MEETING DELETED: ', req.auth.id, req.params.id)

          res.send(200)
        }
      })
  }
}
