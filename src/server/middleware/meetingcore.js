class Entry {
  constructor (collection, db, data, limited) {
    this.collection = collection
    this.db = db

    this.data = data
    this.limited = limited

    this.delete = this.delete.bind(this)
    this.remove = this.remove.bind(this)
  }

  start () {
    const startdate = new Date(this.data.startdate)

    if (startdate.getTime() - Date.now() < 86400000 /* 24 hours */) {
      this.timeout = setTimeout(this.delete, startdate.getTime() + this.data.length - Date.now())
    }
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
    this.entries = []

    this.interval = setInterval(() => { // Refresh timeouts every 24 hours
      for (const entry of this.entries) {
        entry.cancel()

        entry.start()
      }
    }, 86400000 /* 24 hours */)
  }

  upload (db, data, limited) {
    const entry = new Entry(this, db, data, limited)
    entry.start()

    this.entries.push(entry)

    return entry
  }

  remove (id) {
    this.entries.splice(this.entries.findIndex((m) => m.data.id === id), 1)

    return this.entries
  }

  findConflict (startframe, length, room, exclude) {
    const endframe = new Date(startframe.getTime() + length)

    return this.entries.find((m) => {
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
