module.exports = function (req, res, next) {
  res.sendError = function (code, type, message) {
    res.send(code, {
      error: {
        type,
        message
      }
    })
  }

  next()
}
