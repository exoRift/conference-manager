const {
  updateConf: update
} = require('../../util/')

const {
  ROOM_COUNT
} = process.env

module.exports = async function updateConf (req, res) {
  if (req.body.room !== undefined) {
    const parsed = parseInt(req.body.room)

    if (!parsed || parsed < 1 || parsed > ROOM_COUNT) return req.send(400, 'invalid room provided')

    req.body.room = parsed
  }

  update(req.db, req.authUser, req.params.id, {
    title: req.body.title,
    room: req.body.room,
    desc: req.body.desc,
    attendees: req.body.attendees,
    starttime: req.body.starttime,
    endtime: req.body.endtime
  })
    .then(() => res.send(200))
    .catch((err) => res.send(err.code, err.message))
}
