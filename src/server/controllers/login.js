const send = require('@polka/send-type')

module.exports = function login (req, res) {
  req.db('users')
    .select('id', 'pass', 'token')
    .where(req.db.raw('LOWER("name") = ?', req.body.name.toLowerCase()))
    .limit(1)
      .catch((err) => send(res, 503, err.message))
      .then(([row]) => {
        if (row) {
          if (req.body.pass === row.pass) send(res, 200, { id: row.id, token: row.token })
          else send(res, 400, 'invalid pass')
        } else send(res, 400, 'invalid user')
      })
}
