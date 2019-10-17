module.exports = function user (req, res) {
  if (req.params.prop === 'defining') {
    res.send(200, {
      token: undefined,
      pass: undefined,
      ...req.user
    })
  } else res.send(200, typeof req.user[req.params.prop] === 'boolean' ? String(req.user[req.params.prop]) : req.user[req.params.prop])
}
