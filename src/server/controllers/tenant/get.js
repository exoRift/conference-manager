module.exports = {
  requisites: [],
  method: 'get',
  route: '/tenant/:id/:prop',
  action: function (req, res) {
    return req.db('tenants')
      .select(req.params.prop === 'all' ? '*' : req.params.prop)
      .where('id', req.params.id)
      .then(([tenant]) => res.send(200, tenant))
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
