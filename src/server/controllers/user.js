const send = require('@polka/send-type')

module.exports = {
  name: function name (req, res) {
    if (req.params.id) {
      req.db('users')
        .select('name')
        .where({
          id: req.params.id
        })
          .then(([row]) => {
            if (row) send(res, 200, row.name)
            else send(res, 400, 'invalid user')
          })
          .catch((err) => send(res, 503, err.message))
    } else send(res, 400, 'invalid user')
  }
}
