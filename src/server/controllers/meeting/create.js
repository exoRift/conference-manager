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
    return req.util.meeting.create(req)
      .then((id) => {
        console.log('MEETING CREATED: ', req.auth.id, id)

        res.send(200, id)
      })
      .catch((err) => res.send(err.code, err.type, err.message))
  }
}
