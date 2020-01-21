const {
  getUserProp
} = require('../util/')

module.exports = function user (req, res) {
  if (req.authUser) res.send(200, Array.isArray(req.user) ? req.user.map(getUserProp(req.params.prop)) : getUserProp(req.params.prop)(req.user))
  else if (!req.params.prop || req.params.prop === 'name') res.send(200, Array.isArray(req.user) ? req.user.map(getUserProp('name')) : getUserProp('name')(req.user))
}
