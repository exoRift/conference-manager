class Entry {
  constructor (collection, db, data, limited) {
    this.collection = collection
    this.db = db

    this.data = {
      ...data,
      startdate: new Date(data.startdate)
    }
    this.limited = limited

    this.delete = this.delete.bind(this)
    this.remove = this.remove.bind(this)

    this.timeout = this.start(data.length)
  }

  start (length) {
    setTimeout(this.delete, new Date(this.data.startdate).getTime() + length - Date.now())
  }

  delete () { // TODO: ENABLE THIS
    // if (this.limited) this.remove()
    // else {
    //   return this.db('meetings')
    //     .delete()
    //     .where('id', this.data.id)
    //     .then(this.remove)
    //     .catch((err) => console.error('db', err))
    // }
    console.log('DELETE TRIGGERED', this.data.id) // DEBUG
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
    const {
      startdate,
      length
    } = data

    this.data.startdate = startdate || this.data.startdate
    this.data.length = length || this.data.length

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
    const endframe = new Date(new Date(startframe).getTime() + length)

    return this.timeouts.find((m) => {
      const enddate = new Date(new Date(m.data.startdate).getTime() + m.data.length)

      return room === m.data.room && m.data.id !== exclude &&
        ((startframe >= m.data.startdate && startframe <= enddate) || (endframe >= m.data.startdate && endframe <= enddate))
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
