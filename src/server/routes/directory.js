const send = require('@polka/send-type')

module.exports = {
  path: '/directory',
  action: function directory (req, res) {
    return req.db('confs')
      .select()
      .orderBy('starttime')
        .then((rows) => send(res, 200, rows))
        .catch((err) => send(res, 503, err.message))
  }
}
