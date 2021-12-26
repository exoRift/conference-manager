module.exports = function (req, res, next) {
  res.sendError = function (code = 500, type, message, addition = {}) {
    res.send(code, {
      error: {
        type,
        message
      },
      ...addition
    })
  }

  next()
}
