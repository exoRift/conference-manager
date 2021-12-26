import React from 'react'

import postFetch from '../util/postFetch.js'

import '../styles/MeetingCard.css'
import '../styles/MeetingEditor.css'

const {
  REACT_APP_API_URL
} = process.env

const maxLengths = {
  title: 45,
  desc: 150,
  attendee: 25
}
const roomBounds = [1, 2]

class MeetingEditor extends React.Component {
  constructor (props) {
    super(props)

    const start = props.blank
      ? this.toLocalISO(new Date())
      : this.toLocalISO(new Date(props.data.startdate))
    const end = props.blank
      ? this.toLocalISO(new Date(new Date().getTime() + 3600000))
      : this.toLocalISO(new Date(new Date(props.data.startdate).getTime() + props.data.length))

    this.state = {
      data: {
        attendees: [],
        ...props.data,
        startdate: start,
        enddate: end
      },
      alter: {},
      creator: null,
      attendeeInput: '',
      error: null
    }

    this.submit = this.submit.bind(this)
  }

  render () {
    return (
      <div className='meeting-card editing'>
        <div className='header'>
          <input
            className='title'
            placeholder='Title'
            value={this.state.alter.title ?? this.state.data.title ?? ''}
            maxLength={maxLengths.title}
            onChange={this.onChange.bind(this, 'title')}/>
        </div>
        <div className='subheader'>
          <span className='time-container'>
            <input
              className='startdate'
              type='datetime-local'
              value={this.state.alter.startdate ?? this.state.data.startdate}
              onChange={this.onChange.bind(this, 'startdate')}/>

            <span className='dash'>&#x2e3a;</span>

            <input
              className='enddate'
              type='datetime-local'
              value={this.state.alter.enddate ?? this.state.data.enddate}
              onChange={this.onChange.bind(this, 'enddate')}/>
          </span>
        </div>
        <div className='content'>
          <textarea
            className='description'
            placeholder='No Description'
            value={this.state.alter.desc ?? this.state.data.desc ?? ''}
            maxLength={maxLengths.desc}
            onChange={this.onChange.bind(this, 'desc')}/>

          <div className='attendees'>
            {(this.state.alter.attendees || this.state.data.attendees).map((a, i) => (
              <span className='attendee' key={i} onClick={() => this.removeAttendee(i)}>{a}</span>
            ))}

            <input
              className='input'
              value={this.state.attendeeInput}
              maxLength={maxLengths.attendee}
              onChange={this.onChange.bind(this, 'attendeeInput')}/>
          </div>
        </div>

        <div className='footer'>
          <span className='room-container'>
            <input
              className='room'
              type='number'
              min={roomBounds[0]}
              max={roomBounds[1]}
              value={this.state.alter.room ?? this.state.data.room ?? ''}
              onChange={this.onChange.bind(this, 'room')}/>
          </span>

          {this.props.blank
            ? null
            : (
              <button
                className='btn btn-success submit'
                onClick={this.submit}>
                  Save
              </button>
              )}
        </div>
      </div>
    )
  }

  onChange (field, event) {
    if (field === 'room' && (event.target.value < roomBounds[0] || event.target.value > roomBounds[1])) return

    if (field === 'attendeeInput') {
      const containerBounds = event.target.parentElement.getBoundingClientRect()
      const inputBounds = event.target.getBoundingClientRect()

      if (inputBounds.bottom <= containerBounds.bottom) {
        if (event.target.value.endsWith(',')) {
          const name = event.target.value.substring(0, event.target.value.length - 1).trim()

          this.setState({
            attendeeInput: ''
          })

          if (name.length && !(this.state.alter.attendees || this.state.data.attendees).includes(name)) {
            this.setState({
              alter: {
                ...this.state.alter,
                attendees: (this.state.alter.attendees || this.state.data.attendees).concat(name)
              }
            })
          }
        } else {
          this.setState({
            attendeeInput: event.target.value
          })
        }
      } else event.target.disabled = true
    } else {
      this.setState({
        alter: {
          ...this.state.alter,
          [field]: event.target.value
        }
      })
    }

    this.props.onChange?.({
      ...this.state.data,
      ...this.state.alter,
      [field]: event.target.value
    })
  }

  submit () {
    const alter = this.state.alter
    if ('enddate' in alter) alter.length = new Date(alter.enddate).getTime() - new Date(alter.startdate || this.state.data.startdate).getTime()

    fetch(REACT_APP_API_URL + '/meeting/' + this.state.data.id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.auth
      },
      body: JSON.stringify(alter)
    })
      .then(postFetch)
      .then(() => this.props.onSave?.({
        ...this.state.data,
        ...alter
      }))
      .catch(this.props.onError)
  }

  toLocalISO (date) {
    return date.getFullYear() +
      '-' + this.formatNumber(date.getMonth() + 1) +
      '-' + this.formatNumber(date.getDate()) +
      'T' + this.formatNumber(date.getHours()) +
      ':' + this.formatNumber(date.getMinutes())
  }

  formatNumber (num) {
    return num.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })
  }

  removeAttendee (i) {
    const list = this.state.alter.attendees || this.state.data.attendees

    this.setState({
      alter: {
        ...this.state.alter,
        attendees: list.slice(0, i).concat(list.slice(i + 1, list.length))
      }
    })
  }
}

export default MeetingEditor
