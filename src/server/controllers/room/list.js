const {
  ROOM_COUNT
} = process.env

module.exports = {
  requisites: ['authorize'],
  method: 'get',
  route: '/room/list/:id',
  action: function (req, res) {
    if (parseInt(req.params.id) && parseInt(req.params.id) <= parseInt(ROOM_COUNT) && req.params.id > 0) {
      const limiteds = req.meetingCore.timeouts
        .filter((m) => m.limited && m.data.room === parseInt(req.params.id))
        .map((m) => {
          return {
            attendees: [],
            ...m.data,
            limited: true
          }
        })

      return req.db('meetings')
        .select('*', req.db.raw('EXTRACT(EPOCH from length) * 1000 as length'))
        .where('room', req.params.id)
        .orderBy('startdate', 'asc')
        .limit(20)
        .then((meetings) => res.send(200, limiteds.concat(meetings)))
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
    } else return res.sendError(400, 'argument', `invalid room provided (1-${ROOM_COUNT})`)
  }
}
