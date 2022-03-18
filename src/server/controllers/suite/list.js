module.exports = {
  requisites: [],
  method: 'get',
  route: '/suite/list',
  action: function (req, res) {
    return req.db('users')
      .select([req.db.raw('id AS owner'), 'suite', 'tenant'])
      .whereNotNull('suite')
      .whereNotNull('tenant')
      .then((suites) => res.send(200, suites))
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
