const {
  updateConf
} = require('../../util/')

module.exports = async function update (req, res) {
  if (req.auth.admin || req.auth.id === req.conf.creator) {
    updateConf(req.db, req.auth, req.conf.id, {
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
