module.exports = {
  requisites: ['authorize'],
  method: 'delete',
  route: '/meeting/:id',
  options: {
    authorize: {
      allowLimited: true
    }
  },
  action: function (req, res) {
    if (req.auth.limited) {
      const entry = req.meetingCore.entries.find((m) => m.data.id === req.params.id && m.limited)

      if (entry) {
        entry.cancel()
        entry.remove()

        return res.send(200)
      } else return res.sendError(404, 'target', 'meeting not found')
    } else {
      return req.db('meetings')
        .select('creator')
        .where('id', req.params.id)
        .then(([found]) => {
          if (found) {
            if (req.auth.id === found.creator || req.auth.admin) {
              return req.db('meetings')
                .delete()
                .where('id', req.params.id)
                .then(() => {
                  const entry = req.meetingCore.entries.find((m) => m.data.id === req.params.id)

                  if (entry) {
                    entry.cancel()
                    entry.remove()
                  }

                  console.log('MEETING DELETED: ', req.auth.id, req.params.id)

                  return res.send(200)
                })
                .catch((err) => {
                  console.error('db', err)

                  return res.sendError(500, 'internal', 'database unavailable')
                })
            } else return res.sendError(401, 'authorization', 'not authorized to delete this meeting')
          } else return res.sendError(404, 'target', 'meeting not found')
        })
    }
  }
}
