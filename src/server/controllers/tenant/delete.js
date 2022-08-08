module.exports = {
  requisites: ['authorize'],
  method: 'delete',
  route: '/tenant/:id',
  action: function (req, res) {
    if (req.auth.admin) {
      return req.db('tenants')
        .select('name')
        .where('id', req.params.id)
        .then(([tenant]) => {
          if (tenant) {
            return req.db('tenants')
              .delete()
              .where('id', req.params.id)
              .then(() => {
                console.log('TENANT DELETED: ', req.auth.id, req.params.id)

                return res.send(200)
              })
          } else return res.sendError(404, 'target', 'tenant not found')
        })
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
