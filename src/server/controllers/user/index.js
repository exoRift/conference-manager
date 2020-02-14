const {
  getUserProp
} = require('../../util/')

const publicProps = ['id', 'name', 'admin']

module.exports = function user (req, res) {
  if (req.params.prop === 'pass' || req.params.prop === 'token') return res.send(401)

  req.db.schema.hasColumn('users', req.params.prop)
    .catch(() => {
      const err = Error('database unavailable')
      err.code = 503

      throw err
    })
    .then((has) => {
      if (has || req.params.prop === 'registered' || req.params.prop === 'defining' || !req.params.prop) {
        if (req.authUser) res.send(200, Array.isArray(req.user) ? req.user.map(getUserProp(req.params.prop)) : getUserProp(req.params.prop)(req.user))
        else if (!req.params.prop || publicProps.includes(req.params.prop)) res.send(200, Array.isArray(req.user) ? req.user.map(getUserProp(req.params.prop || 'name')) : getUserProp(req.params.prop || 'name')(req.user))
      } else res.send(400, 'invalid prop')
    })
}
