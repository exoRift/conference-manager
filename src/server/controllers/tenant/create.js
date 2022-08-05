module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    name: 'string',
    suite: 'string'
  },
  options: {
    argtypes: {
      name: {
        maxStringLen: 20
      },
      suite: {
        maxStringLen: 4
      }
    }
  },
  method: 'post',
  route: '/tenant',
  action: function (req, res) {
    return req.db('tenants')
      .select('name', 'suite')
      .where('name', req.args.name)
      .orWhere('suite', req.args.suite)
      .then(([tenant]) => {
        if (tenant) {
          return res.sendError(409, tenant.suite === req.args.suite ? 'suite' : 'name', `"${tenant.name} is already assigned to suite ${tenant.suite}"`)
        }

        const id = String(Date.now())

        return req.db('tenants')
          .insert({
            id,
            name: req.args.name,
            suite: req.args.suite
          })
          .then(() => {
            console.log('TENANT CREATED: ', req.auth.id, id)

            return res.send(200)
          })
      })
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
