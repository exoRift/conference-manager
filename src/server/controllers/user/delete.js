const {
  promises: {
    readFile
  }
} = require('fs')

module.exports = {
  requisites: ['authorize'],
  method: 'delete',
  route: '/user/:id',
  action: function (req, res) {
    if (req.auth.admin) {
      return req.db('users')
        .select('firstname', 'lastname', 'email', 'token')
        .where('id', req.params.id)
        .then(([found]) => {
          if (found) {
            if (found.email === 'sys@admin' || found.email === 'cr@panel') return res.sendError(403, 'target', 'protected user')

            return req.db('users')
              .delete()
              .where('id', req.params.id)
              .then(() => {
                console.log('USER DELETED: ', req.auth.id, req.params.id)

                return readFile(`src/server/templates/${found.token ? 'deleted' : 'canceled'}.ejs`, { encoding: 'utf8' })
                  .then((template) => req.util.user.email({
                    address: found.email,
                    subject: `${found.token ? 'Account deleted' : 'Account creation canceled'} by ${req.auth.firstname} ${req.auth.lastname}`,
                    template,
                    material: {
                      name: `${found.firstname} ${found.lastname}`,
                      executor: `${req.auth.firstname} ${req.auth.lastname}`
                    }
                  }))
                  .then(() => res.send(200))
                  .catch((err) => res.sendError(206, err.type, 'user deleted but ' + err.message))
              })
              .catch((err) => {
                console.error('db', err)

                return res.sendError(500, 'internal', 'database unavailable')
              })
          } else return res.sendError(404, 'target', 'user not found')
        })
        .catch((err) => {
          console.error('db', err)

          return res.sendError(500, 'internal', 'database unavailable')
        })
    } else return res.sendError(401, 'authorization', 'must be admin')
  }
}
