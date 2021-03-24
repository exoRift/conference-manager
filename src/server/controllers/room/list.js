const {
  ROOM_COUNT
} = process.env

module.exports = {
  requisites: [],
  method: 'get',
  route: '/room/:id/list',
  action: function (req, res) {
    if (parseInt(req.params.id) && parseInt(req.params.id) <= parseInt(ROOM_COUNT) && req.params.id > 0) {
      return req.db('meetings')
        .select()
        .where('room', req.params.id)
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
        .then((meetings) => res.send(200, meetings))
    } else return res.sendError(400, 'argument', `invalid room provided (1-${ROOM_COUNT})`)
  }
}
