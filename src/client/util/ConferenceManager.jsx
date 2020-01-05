import React from 'react'

import DatePicker from 'react-datetime'
import AttendeesInput from './AttendeesInput.jsx'
import Popup from './Popup.jsx'

import trashIcon from '../../assets/trash.svg'

import 'react-datetime/css/react-datetime.css'

const {
  REACT_APP_API_URL
} = process.env

const momentDateFormat = 'MMM DD YYYY,'
const momentTimeFormat = 'h:mm a'

class ConferenceManager extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      confs: [],
      final: [],
      editing: [],
      users: [],
      saved: false,
      error: null,
      readyDelete: undefined
    }

    this.onChange = this.onChange.bind(this)
    this.onToggle = this.onToggle.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.readyDelete = this.readyDelete.bind(this)
    this.unreadyDelete = this.unreadyDelete.bind(this)
    this.onDelete = this.onDelete.bind(this)
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

  async checkConf (conf) {
    if (!conf.attendees) conf.attendees = []

    for (const param in conf) {
      if (typeof conf[param] === 'string' && !conf[param].length) {
        throw Error('Parameter cannot be empty: ' + param.substring(0, 1).toUpperCase() + param.substring(1))
      }

      if (param === 'attendees') {
        const newAttendees = []

        for (const attendee of conf.attendees) {
          const user = this.state.users.find((u) => u.name.toLowerCase() === attendee.toLowerCase())

          if (user) newAttendees.push(user.id)
          else {
            throw Error('Invalid user: ' + attendee)
          }
        }

        return {
          ...conf,
          attendees: newAttendees
        }
      }
    }

    return conf
  }

  onChange (conf, prop) {
    return (event) => {
      if (prop) {
        event = {
          target: {
            value: event,
            id: prop
          }
        }
      }
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

  readyDelete (conf) {
    return () => {
      this.setState({
        readyDelete: {
          id: conf.id,
          conf: conf.title
        }
      })
    }
  }

  unreadyDelete () {
    this.setState({
      readyDelete: undefined
    })
  }

  onDelete (conf) {
    return () => {
      fetch(REACT_APP_API_URL + '/conference/delete/' + conf, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('auth')
        }
      }).then((data) => {
        if (data.ok) {
          const changes = [
            ...this.state.confs
          ]

          changes.splice(changes.findIndex((c) => c.id === conf), 1)

          this.setState({
            confs: changes,
            readyDelete: undefined
          })
        }
      })
    }
  }

  onSubmit () {
    const promises = []

    for (const { ...conf } of this.state.final) {
      this.checkConf(conf)
        .then((data) => {
          promises.push(fetch(`${REACT_APP_API_URL}/conference/${data.id}/update`, {
            method: 'POST',
            headers: {
              Authorization: localStorage.getItem('auth'),
              Accept: 'text/plain',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          }))
        })
        .catch((err) => {
          this.setState({
            saved: true,
            error: err.message
          })
        })
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

  create (conf) {
    return this.checkConf(conf)
      .then((data) => fetch(REACT_APP_API_URL + '/conference/create', {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('auth'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }))
      .then(async (data) => {
        if (data.ok) {
          return data.text().then((id) => {
            this.setState({
              confs: this.state.confs.concat([{
                ...conf,
                id
              }])
            })

            return data
          })
        } else throw Error(await data.text())
      })
  }

  render () {
    return (
      <>
        {
          this.state.readyDelete ? (
            <Popup message={`Are you sure you want to delete ${this.state.readyDelete.conf}?`} noChoice={this.unreadyDelete} yesChoice={this.onDelete(this.state.readyDelete.id)}/>
          ) : null
        }
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
              const disabled = !this.state.editing.includes(c.id)
              const onChange = this.onChange(c.id)

              const attendeesBox = (
                <AttendeesInput users={this.state.users} attendees={c.attendees} onChange={onChange} id='attendees' disabled={disabled}/>
              )

              return (
                <div className='objectContainer' key={c.id}>
                  <input value={c.title} onChange={onChange} id='title' disabled={disabled}/>
                  <input value={c.room} onChange={onChange} id='room' disabled={disabled}/>
                  <input value={c.desc} onChange={onChange} id='desc' disabled={disabled}/>
                  {attendeesBox}
                  <DatePicker
                    value={new Date(c.starttime)}
                    local='en-US'
                    dateFormat={momentDateFormat}
                    timeFormat={momentTimeFormat}
                    className={disabled ? 'disabled' : 'enabled'}
                    onChange={this.onChange(c.id, 'starttime')}
                  />
                  <DatePicker
                    value={new Date(c.endtime)}
                    local='en-US'
                    dateFormat={momentDateFormat}
                    timeFormat={momentTimeFormat}
                    className={disabled ? 'disabled' : 'enabled'}
                    onChange={this.onChange(c.id, 'endtime')}
                  />

                  <div className='trashContainer' id={disabled ? 'disabled' : 'enabled'} onClick={disabled ? null : this.readyDelete(c)}>
                    <div className='imgContainer'>
                      <img src={trashIcon} alt='delete'/>
                    </div>
                  </div>

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
      </>
    )
  }
}

export default ConferenceManager
