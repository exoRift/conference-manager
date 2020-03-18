const {
  createConf: create
} = require('../../util/')

module.exports = async function createConf (req, res) {
  create(req.db, req.auth, {
    title: req.body.title,
    room: req.body.room,
    desc: req.body.desc,
    attendees: req.body.attendees,
    starttime: req.body.starttime,
    endtime: req.body.endtime
  })
    .then((id) => res.send(200, id))
    .catch((err) => res.send(err.code, err.message))
}
