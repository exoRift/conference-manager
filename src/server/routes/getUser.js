const send = require('@polka/send-type')

module.exports = {
  path: '/getUser',
  type: 'post',
  action: function getUser (req, res) {
    req.db('users')
      .select('name', 'pass', 'token')
      .where(req.db.raw('LOWER("name") = ?', req.body.name.toLowerCase()))
      .limit(1)
        .catch((err) => send(res, 503, err.message))
        .then(([row]) => {
          if (row) {
            if (req.body.pass === row.pass) send(res, 200, {
              token: row.token,
              name: row.name
            })
            else send(res, 400, 'invalid pass')
          } else send(res, 400, 'invalid user')
        })
  }
}