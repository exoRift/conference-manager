const {
  promises: {
    readFile
  }
} = require('fs')

module.exports = {
  requisites: ['authorize'],
  method: 'delete',
  route: '/user/:id/delete',
  action: function (req, res) {
    if (req.auth.admin) {
      return req.db('users')
        .select(['firstname', 'lastname', 'email'])
        .where('id', req.params.id)
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
        .then(([found]) => {
          if (found) {
            return req.db('users')
              .delete()
              .where('id', req.params.id)
              .catch((err) => {
                console.error('db', err)

                return res.sendError(500, 'internal', 'database unavailable')
              })
              .then(() => {
                console.log('USER DELETED: ', req.auth.id, req.params.id)

                return readFile('src/server/templates/deleted.ejs', { encoding: 'utf8' })
                  .then((temp) => req.util.user.email({
                    subject: `Account deleted by ${req.auth.firstname} ${req.auth.lastname}`,
                    temp,
                    material: {
                      name: `${req.args.firstname} ${req.args.lastname}`,
                      executor: `${req.auth.firstname} ${req.auth.lastname}`
                    }
                  }))
                  .catch((err) => res.sendError(err.code, err.type, err.message))
                  .then(() => res.send(200))
              })
          } else return res.sendError(404, 'target', 'user not found')
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
