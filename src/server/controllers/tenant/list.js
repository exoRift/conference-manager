module.exports = {
  requisites: [],
  method: 'get',
  route: '/tenant/list',
  action: function (req, res) {
    return req.db('tenants')
      .select([req.db.raw('name AS tenant'), 'suite'])
      .orderBy('suite', 'asc')
      .then((suites) => res.send(200, suites))
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
