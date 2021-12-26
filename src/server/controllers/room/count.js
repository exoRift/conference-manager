const {
  ROOM_COUNT
} = process.env

module.exports = {
  requisites: [],
  method: 'get',
  route: '/room/count',
  action: function (req, res) {
    return res.send(200, ROOM_COUNT)
  }
}
