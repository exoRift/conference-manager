module.exports = {
  requisites: [],
  method: 'get',
  route: '/tenant/list',
  action: function (req, res) {
    return req.db('tenants')
      .select('id', 'name', 'suite')
      .orderBy('suite', 'asc')
      .then((tenants) => res.send(200, tenants))
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
