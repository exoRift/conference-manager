const {
  ROOM_COUNT
} = process.env

module.exports = function room (req, res) {
  if (req.params.room) {
    const room = parseInt(req.params.room)

    if (!room || room > ROOM_COUNT) return res.send(400, 'invalid room')

    const current = new Date()

    req.db('confs')
      .select()
      .where({
        room
      })
      .andWhere((builder) => {
        builder.where('endtime', '>', current)
      })
      .orderBy('starttime')
      .limit(2)
      .then(([next, upcoming]) => res.send(200, { next, upcoming }))
      .catch(() => res.send(503, 'database unavailable'))
  } else res.send(400, 'no room provided')
}