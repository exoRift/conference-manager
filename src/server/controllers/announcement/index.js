module.exports = function announcement (req, res) {
  res.send(200, req.announcement)
}
