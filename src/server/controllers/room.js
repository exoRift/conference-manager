const {
  ROOM_COUNT
} = process.env

module.exports = function room (req, res) {
  if (req.params.room) {
    const room = parseInt(req.params.room)

    if (!room || room > ROOM_COUNT) return res.send(400, 'invalid room')

    const current = new Date()

    return req.db('confs')
      .select()
      .where({
        room
      })
      .andWhere((builder) => {
        builder.where('endtime', '>', current)
      })
      .orderBy('starttime')
      .limit(2)
        .catch(() => res.send(503, 'database unavailable'))
        .then(([next, upcoming]) => res.send(200, { next, upcoming }))
  } else res.send(400, 'no room provided')
}
