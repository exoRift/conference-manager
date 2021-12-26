const {
  ROOM_COUNT
} = process.env

module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    title: 'opt:string',
    room: 'opt:number',
    desc: 'opt:string',
    attendees: 'opt:array',
    startdate: 'opt:date',
    length: 'opt:number'
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
  method: 'patch',
  route: '/meeting/:id',
  action: function (req, res) {
    if (req.auth.limited) {
      const entry = req.meetingCore.timeouts.find((m) => m.data.id === req.params.id && m.limited)

      if (entry) {
        req.args = {
          ...entry.data,
          ...req.args
        }

        return req.util.meeting.validate(req.params.id)
          .then(() => {
            entry.update(req.args)

            return res.send(200)
          })
          .catch((err) => res.sendError(err.code, err.type, err.message))
      } else return res.sendError(404, 'target', 'meeting not found')
    } else {
      return req.db('meetings')
        .select()
        .where('id', req.params.id)
        .then(([found]) => {
          if (found) {
            if (req.auth.id === found.creator || req.auth.admin) {
              if (req.args.room ? (req.args.room <= parseInt(ROOM_COUNT) && req.args.room > 0) : true) {
                return req.util.meeting.validate(req.params.id)
                  .then(() => req.db('meetings')
                    .update({
                      ...req.args,
                      length: req.args.length ? req.args.length + ' milliseconds' : undefined,
                      attendees: req.args.attendees ? JSON.stringify(req.args.attendees) : undefined
                    })
                    .where('id', req.params.id)
                    .then(() => {
                      console.log('MEETING UPDATED: ', req.auth.id, req.params.id)

                      return res.send(200)
                    })
                    .catch((err) => {
                      console.error('db', err)

                      return res.sendError(500, 'internal', 'database unavailable')
                    }))
                  .catch((err) => res.sendError(err.code, err.type, err.message))
              } else return res.sendError(400, 'argument', `invalid room provided (1-${ROOM_COUNT})`)
            } else return res.sendError(401, 'authorization', 'not authorized to update this meeting')
          } else return res.sendError(404, 'target', 'meeting not found')
        })
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
    }
  }
}
