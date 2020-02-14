const {
  ROOM_COUNT
} = process.env

module.exports = function roomCount (req, res) {
  res.send(200, ROOM_COUNT)
}
