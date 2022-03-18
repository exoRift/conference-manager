module.exports = {
  requisites: ['authorize'],
  options: {
    authorize: {
      optional: true,
      allowLimited: true
    }
  },
  method: 'get',
  route: '/user/:id/:prop',
  action: function (req, res) {
    const restricted = [
      'pass',
      'token'
    ]
    const privilleged = [
      'email'
    ]

    if (restricted.includes(req.params.prop)) return res.sendError(401, 'argument', 'property forbidden')
    if (privilleged.includes(req.params.prop) && !req.auth) return res.sendError(401, 'argument', 'property requires account to view')

    const partialQuery = req.db.raw('CASE WHEN token IS NULL THEN true ELSE false END as partial')

    return req.db.schema.hasColumn('users', req.params.prop)
      .then((exists) => {
        if (exists || ['all', 'name', 'partial'].includes(req.params.prop)) {
          return req.db('users')
            .select(...(req.params.prop === 'all'
              ? ['*', partialQuery]
              : req.params.prop === 'name'
                ? ['firstname', 'lastname']
                : req.params.prop === 'suite'
                  ? ['suite', 'tenant']
                  : req.params.prop === 'partial'
                    ? [partialQuery]
                    : [req.params.prop]))
            .where('id', req.params.id)
            .then(([found]) => {
              if (found) {
                for (const prop of restricted.concat(req.auth ? [] : privilleged)) delete found[prop]

                return res.send(200, found)
              } else return res.sendError(404, 'target', 'user not found')
            })
            .catch((err) => {
              console.error('db', err)

              return res.sendError(500, 'internal', 'database unavailable')
            })
        } else return res.sendError(404, 'argument', 'property not found')
      })
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
  }
}
