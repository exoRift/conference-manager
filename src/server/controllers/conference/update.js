const {
  updateConf: update
} = require('../../util/')

module.exports = async function updateConf (req, res) {
  if (req.auth.admin || req.auth.id === req.conf.creator) {
    update(req.db, req.auth, req.conf.id, {
      title: req.body.title,
      room: req.body.room,
      desc: req.body.desc,
      attendees: req.body.attendees,
      starttime: req.body.starttime,
      endtime: req.body.endtime
    })
      .then(() => res.send(204))
      .catch((err) => res.send(err.code, err.message))
  } else res.send(401)
}
