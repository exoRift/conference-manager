import React from 'react'

import AttendeesInput from './AttendeesInput.jsx'

const {
  REACT_APP_API_URL
} = process.env

const timeRegex = /:.+?:.+?Z/

class ConferenceManager extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      confs: [],
      final: [],
      editing: [],
      users: [],
      saved: false,
      error: null
    }

    this.onChange = this.onChange.bind(this)
    this.onToggle = this.onToggle.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount () {
    fetch(REACT_APP_API_URL + '/conference/all').then((data) => {
      if (data.ok) {
        data.json().then((confs) => {
          fetch(REACT_APP_API_URL + '/user/all/defining', {
            headers: {
              Authorization: localStorage.getItem('auth')
            }
          }).then((data) => {
            if (data.ok) {
              data.json().then((users) => {
                for (const conf of confs) {
                  conf.attendees = conf.attendees.map((a) => users.find((u) => u.id === a).name)
                  conf.starttime = conf.endtime.replace(timeRegex, ':00')
                  conf.endtime = conf.endtime.replace(timeRegex, ':00')
                }

                this.setState({
                  confs,
                  users
                })
              })
            }
          })
        })
      }
    })
  }

  onChange (conf) {
    return (event) => {
      const index = this.state.confs.findIndex((c) => c.id === conf)

      const changes = this.state.confs

      if (event.target.id === 'room' && event.target.value.length > 1) return

      changes[index][event.target.id] = event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value

      this.setState({
        confs: changes
      })
    }
  }

  onToggle (event) {
    if (this.state.editing.includes(event.target.id)) {
      const changes = this.state.final
      const conf = this.state.confs.find((c) => c.id === event.target.id)
      const index = changes.findIndex((c) => c.id === conf.id)

      if (index === -1) changes.push(conf)
      else changes[index] = conf

      this.setState({
        final: changes
      })
    }

    const changes = this.state.editing

    const index = this.state.editing.findIndex((u) => u === event.target.id)

    if (index === -1) changes.push(event.target.id)
    else changes.splice(index, 1)

    this.setState({
      editing: changes
    })
  }

  onSubmit () {
    const promises = []

    for (const conf of this.state.final) {
      for (const param in conf) {
        if (typeof conf[param] === 'string' && !conf[param].length) {
          return this.setState({
            saved: true,
            error: 'Parameter cannot be empty: ' + param.substring(0, 1).toUpperCase() + param.substring(1)
          })
        }

        if (param === 'attendees') {
          const newAttendees = []

          for (const attendee of conf.attendees) {
            const user = this.state.users.find((u) => u.name.toLowerCase() === attendee.toLowerCase())

            if (user) newAttendees.push(user.id)
            else {
              return this.setState({
                error: 'Invalid user: ' + attendee
              })
            }
          }

          conf.attendees = newAttendees
        }
      }

      promises.push(fetch(`${REACT_APP_API_URL}/conference/${conf.id}/update`, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('auth'),
          Accept: 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conf)
      }))
    }

    Promise.all(promises).then((responses) => {
      this.setState({
        error: null,
        saved: true
      })

      for (const data of responses) {
        if (!data.ok) {
          data.text().then((error) => this.setState({
            error
          }))

          break
        }
      }

      setTimeout(() => this.setState({
        saved: false
      }), 2000)
    })
  }

  render () {
    console.log(this.state)
    return (
      <div className='confs'>
        <div className='headers'>
          <h3>Title</h3>
          <h3 id='room'>Room</h3>
          <h3>Description</h3>
          <h3>Attendees</h3>
          <h3>Start Time</h3>
          <h3>End Time</h3>
        </div>

        <div className='confContainer'>
          {this.state.confs.map((c) => {
            const onChange = this.onChange(c.id)

            const attendeesBox = (
              <AttendeesInput users={this.state.users} attendees={c.attendees} onChange={onChange} id='attendees' disabled={!this.state.editing.includes(c.id)}/>
            )

            return (
              <div className='objectContainer' key={c.id}>
                <input value={c.title} onChange={onChange} id='title' disabled={!this.state.editing.includes(c.id)}/>
                <input value={c.room} onChange={onChange} id='room' disabled={!this.state.editing.includes(c.id)}/>
                <input value={c.desc} onChange={onChange} id='desc' disabled={!this.state.editing.includes(c.id)}/>
                {attendeesBox}
                <input type='datetime-local' value={c.starttime} onChange={onChange} id='starttime' disabled={!this.state.editing.includes(c.id)}/>
                <input type='datetime-local' value={c.endtime} onChange={onChange} id='endtime' disabled={!this.state.editing.includes(c.id)}/>

                <button type='button' onClick={this.onToggle} id={c.id}>{this.state.editing.includes(c.id) ? '\u2714' : '\u270E'}</button>
              </div>
            )
          })}
        </div>

        {this.state.saved
          ? this.state.error
            ? (
              <div className='adminErrorContainer'>
                <h6 className='error'>{this.state.error}</h6>
              </div>
            )
            : (
              <h4 className='adminSavedNotif'>Changes saved!</h4>
            )
          : null}
      </div>
    )
  }
}

export default ConferenceManager
