const {
  getUserProp
} = require('../util/')

module.exports = function user (req, res) {
  res.send(200, Array.isArray(req.user) ? req.user.map(getUserProp(req.params.prop)) : getUserProp(req.params.prop)(req.user))
}
