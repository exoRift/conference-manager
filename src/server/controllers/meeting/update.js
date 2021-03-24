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
    req.db('meetings')
      .select()
      .where('id', req.params.id)
      .catch((err) => {
        console.error('db', err)

        res.send(500, 'internal', 'database unavailable')
      })
      .then(([found]) => {
        if (found) {
          req.body.args = {
            ...found,
            ...req.body.args
          }

          return req.util.meeting.validate(req, req.params.id)
            .catch((err) => res.send(err.code, err.type, err.message))
            .then(() => req.db
              .update(req.body.args)
              .where('id', req.params.id))
            .catch((err) => {
              console.error('db', err)

              res.send(500, 'internal', 'database unavailable')
            })
            .then(() => {
              console.log('MEETING UPDATED: ', req.auth.id, req.params.id)

              res.send(200)
            })
        } else res.send(404, 'target', 'meeting does not exist')
      })
  }
}
