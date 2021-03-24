const {
  ROOM_COUNT
} = process.env

module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    title: 'string',
    room: 'number',
    desc: 'opt:string',
    attendees: 'opt:array',
    starttime: 'date',
    endtime: 'date'
  },
  method: 'post',
  route: '/meeting/create',
  action: function (req, res) {
    if (req.args.room > parseInt(ROOM_COUNT) || req.args.room < 1) {
      return req.util.meeting.validate()
        .then(() => {
          const id = String(Date.now())

          return req.db('meetings')
            .insert({
              id,
              attendees: [],
              creator: req.auth.id,
              ...req.args
            })
            .catch((err) => {
              console.error('db', err)

              return res.sendError(500, 'internal', 'database unavailable')
            })
            .then(() => {
              console.log('MEETING CREATED: ', req.auth.id, id)

              res.send(200, id)
            })
        })
    } else res.sendError(400, 'argument', `invalid room provided (1-${ROOM_COUNT})`)
  }
}
