class Entry {
  constructor (collection, db, data, limited) {
    this.collection = collection
    this.db = db

    this.data = data
    this.limited = limited

    this.delete = this.delete.bind(this)
    this.remove = this.remove.bind(this)

    this.timeout = this.start(data.length)
  }

  start (length) {
    const startdate = new Date(this.data.startdate)

    if (startdate.getTime() - Date.now() < 172800000 /* 48 hours */) return setTimeout(this.delete, startdate.getTime() + length - Date.now())
  }

  delete () {
    if (this.limited) this.remove()
    else {
      return this.db('meetings')
        .delete()
        .where('id', this.data.id)
        .then(this.remove)
        .catch((err) => console.error('db', err))
    }
  }

  remove () {
    return this.collection.remove(this.data.id)
  }

  cancel () {
    this.timeout = clearTimeout(this.timeout)
  }

  expedite () {
    this.cancel()

    return this.delete()
  }

  update (data) {
    this.data = {
      ...this.data,
      ...data
    }

    this.cancel()
    this.start(this.data.length)
  }
}

class Core {
  constructor () {
    this.timeouts = []
  }

  upload (db, data, limited) {
    const entry = new Entry(this, db, data, limited)

    this.timeouts.push(entry)

    return entry
  }

  remove (id) {
    this.timeouts.splice(this.timeouts.findIndex((m) => m.data.id === id), 1)

    return this.timeouts
  }

  findConflict (startframe, length, room, exclude) {
    const endframe = new Date(startframe.getTime() + length)

    return this.timeouts.find((m) => {
      const enddate = new Date(m.data.startdate.getTime() + m.data.length)

      return room === m.data.room && m.data.id !== exclude &&
        ((startframe >= m.data.startdate && startframe <= enddate) || (m.data.startdate >= startframe && m.data.startdate <= endframe))
    })
  }
}

const core = new Core()

module.exports = {
  core,
  middleware: function (req, res, next) {
    req.meetingCore = core

    next()
  }
}
