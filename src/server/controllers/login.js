const bcrypt = require('bcrypt')

module.exports = function login (req, res) {
  req.db('users')
    .select('pass', 'token')
    .where(req.db.raw('LOWER("name") = ?', req.body.name.toLowerCase()))
    .limit(1)
      .catch(() => res.send(503, 'database unavailable'))
      .then(([row]) => {
        if (row) {
          bcrypt.compare(req.body.pass, row.pass, (err, match) => {
            if (err) res.send(503, 'encryption comparison')

            if (match) res.send(200, row.token)
            else res.send(400, 'invalid pass')
          })
        } else res.send(400, 'invalid user')
      })
}
