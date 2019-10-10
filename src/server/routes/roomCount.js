const send = require('@polka/send-type')

const {
  ROOM_COUNT
} = process.env

module.exports = {
  path: '/roomCount',
  action: function roomCount (req, res) {
    send(res, 200, ROOM_COUNT)
  }
}
