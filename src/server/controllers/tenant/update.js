module.exports = {
  requisites: ['authorize', 'argtypes'],
  args: {
    name: 'opt:string',
    suite: 'opt:string'
  },
  options: {
    argtypes: {
      name: {
        maxStringLen: 50
      },
      suite: {
        maxStringLen: 4
      }
    }
  },
  method: 'patch',
  route: '/tenant/:id',
  action: function (req, res) {
    return req.db('tenants')
      .select('name')
      .where('id', req.params.id)
      .then(async ([tenant]) => {
        if (tenant) {
          if (!req.auth.admin) {
            if (req.args.suite) return res.sendError(401, 'authorization', 'not authorized to update suite')

            if (req.args.name) {
              const member = await req.db('users')
                .select(req.db.raw(`tenant = ${req.params.id} AS member`))
                .where('id', req.auth.id)
                .then(([{ member }]) => member)

              if (!member) return res.sendError(401, 'authorization', 'must be a tenant member to change its name')
            }
          }

          return req.db('tenants')
            .select('name', 'suite')
            .where('suite', req.args.suite || '')
            .then(([tenant]) => {
              if (tenant) return res.sendError(409, 'argument', `"${tenant.name} is already assigned to suite ${tenant.suite}"`)

              return req.db('tenants')
                .update(req.args)
                .where('id', req.params.id)
                .then(() => res.send(200))
                .catch((err) => {
                  console.error('db', err)

                  return res.sendError(500, 'internal', 'database unavailable')
                })
            })
            .catch((err) => {
              console.error('db', err)

              return res.sendError(500, 'internal', 'database unavailable')
            })
        } else res.sendError(404, 'target', 'tenant not found')
      })
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
