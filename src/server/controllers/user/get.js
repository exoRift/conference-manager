module.exports = {
  requisites: ['authorize'],
  method: 'get',
  route: '/user/:id/:prop',
  action: function (req, res) {
    const allowed = [
      'id',
      'firstname',
      'lastname',
      'email',
      'admin'
    ]

    return req.db.schema.hasColumn('users', req.params.prop)
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
      .then((exists) => {
        if (exists) {
          if (allowed.includes(req.params.prop) || req.params.prop === 'all') {
            return req.db('users')
              .select(req.params.prop === 'all' ? allowed : req.params.prop)
              .where('id', req.params.id)
              .catch((err) => {
                console.error('db', err)

                return res.sendError(500, 'internal', 'database unavailable')
              })
              .then(([found]) => {
                if (found) return res.send(200, found)
                else return res.sendError(404, 'target', 'user not found')
              })
          } else return res.sendError(404, 'argument', 'property not found')
        } else return res.sendError(401, 'argument', 'property forbidden')
      })
  }
}
