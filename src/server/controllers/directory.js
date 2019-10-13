const send = require('@polka/send-type')

module.exports = function directory (req, res) {
  return req.db('confs')
    .select()
    .orderBy('starttime')
      .catch((err) => send(res, 503, err.message))
      .then((rows) => send(res, 200, rows))
}
