const send = require('@polka/send-type')

const {
  ROOM_COUNT
} = process.env

module.exports = {
  path: '/room',
  action: function room (req, res) {
    if (!req.query.room) return send(res, 400, 'no room provided')
  
    const room = parseInt(req.query.room)
  
    if (!room || room > ROOM_COUNT) return send(res, 400, 'invalid room')

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
        .catch((err) => send(res, 503, err.message))
        .then(([next, upcoming]) => send(res, 200, { next, upcoming }))
  }
}
