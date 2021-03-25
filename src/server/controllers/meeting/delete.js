module.exports = {
  requisites: ['authorize'],
  method: 'delete',
  route: '/meeting/:id/delete',
  action: function (req, res) {
    return req.db('meetings')
      .select('creator')
      .where('id', req.params.id)
      .catch((err) => {
        console.error('db', err)

        return res.sendError(500, 'internal', 'database unavailable')
      })
      .then(([found]) => {
        if (found) {
          if (req.auth.id === found.creator || req.auth.admin) {
            return req.db('meetings')
              .delete()
              .where('id', req.params.id)
              .catch((err) => {
                console.error('db', err)

                return res.sendError(500, 'internal', 'database unavailable')
              })
              .then(() => {
                console.log('MEETING DELETED: ', req.auth.id, req.params.id)

                return res.send(200)
              })
          } else return res.sendError(401, 'authorization', 'not authorized to delete this meeting')
        } else return res.sendError(404, 'target', 'meeting not found')
      })
  }
}
