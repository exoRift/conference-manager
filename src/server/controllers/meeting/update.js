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
    starttime: 'opt:date',
    endtime: 'opt:date'
  },
  method: 'patch',
  route: '/meeting/:id/update',
  action: function (req, res) {
    return req.db('meetings')
      .select('creator')
      .where('id', req.params.id)
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
      .then(([meeting]) => {
        if (req.auth.id === meeting.creator) {
          if (req.args.room <= parseInt(ROOM_COUNT) && req.args.room > 0) {
            return req.db('meetings')
              .select()
              .where('id', req.params.id)
              .catch((err) => {
                console.error('db', err)

                return res.sendError(500, 'internal', 'database unavailable')
              })
              .then(([found]) => {
                if (found) {
                  req.args = {
                    ...found,
                    ...req.args
                  }

                  return req.util.meeting.validate(req.params.id)
                    .catch((err) => res.sendError(err.code, err.type, err.message))
                    .then(() => req.db
                      .update(req.args)
                      .where('id', req.params.id))
                    .catch((err) => {
                      console.error('db', err)

                      return res.sendError(500, 'internal', 'database unavailable')
                    })
                    .then(() => {
                      console.log('MEETING UPDATED: ', req.auth.id, req.params.id)

                      return res.send(200)
                    })
                } else return res.sendError(404, 'target', 'meeting does not exist')
              })
          } else return res.sendError(400, 'argument', `invalid room provided (1-${ROOM_COUNT})`)
        } else return res.sendError(401, 'authorization', 'you do not own this meeting')
      })
  }
}
