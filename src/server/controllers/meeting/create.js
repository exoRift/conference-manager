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
    startdate: 'opt:date',
    length: 'number'
  },
  options: {
    authorize: {
      allowLimited: true
    },
    argtypes: {
      title: {
        maxStringLen: 45
      },
      desc: {
        maxStringLen: 150
      },
      length: {
        absolute: true
      }
    }
  },
  method: 'post',
  route: '/meeting',
  action: function (req, res) {
    if (req.args.room <= parseInt(ROOM_COUNT) && req.args.room > 0) {
      if (req.auth.limited || !req.args.startdate) req.args.startdate = Date.now()

      return req.util.meeting.validate()
        .then(() => {
          const id = String(Date.now())

          if (req.auth.limited) {
            req.meetingCore.upload(req.db, {
              id,
              creator: req.auth.id,
              ...req.args
            }, true)

            return res.send(200, id)
          } else {
            return req.db('meetings')
              .insert({
                id,
                creator: req.auth.id,
                ...req.args,
                length: req.args.length + ' milliseconds',
                attendees: JSON.stringify(req.args.attendees)
              })
              .catch((err) => {
                console.error('db', err)

                return res.sendError(500, 'internal', 'database unavailable')
              })
              .then(() => {
                req.meetingCore.upload(req.db, {
                  id,
                  creator: req.auth.id,
                  ...req.args
                })

                console.log('MEETING CREATED: ', req.auth.id, id)

                return res.send(200, id)
              })
          }
        })
        .catch((err) => res.sendError(err.code, err.type, err.message))
    } else return res.sendError(400, 'argument', `invalid room provided (1-${ROOM_COUNT})`)
  }
}
