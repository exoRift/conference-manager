module.exports = {
  requisites: ['authorize'],
  options: {
    authorize: {
      optional: true
    }
  },
  method: 'get',
  route: '/meeting/list/:id',
  action: function (req, res) {
    return req.db('meetings')
      .select('*', req.db.raw('EXTRACT(EPOCH from length) * 1000 as length'))
      .where('creator', req.params.id)
      .orderBy('startdate', 'asc')
      .then((meetings) => res.send(200, meetings.map((m) => ({ ...m, length: parseInt(m.length) }))))
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
