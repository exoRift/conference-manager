import React from 'react'

import postFetch from '../util/postFetch.js'

import '../styles/MeetingCard.css'
import '../styles/MeetingEditor.css'

class MeetingEditor extends React.Component {
  static defaultProps = {
    data: {},
    blank: false
  }

  static maxLengths = {
    title: 45,
    desc: 150
  }

  static defaultLength = 3600000 /* 1 hour */
  static minLength = 900000 /* 15 minutes */

  constructor (props) {
    super(props)

    this.state = {
      data: props.data,
      alter: {},
      creator: {},
      roomCount: 0
    }

    if (props.blank) {
      this.state.alter.startdate = new Date().toISOString()

      this.state.alter.length = MeetingEditor.defaultLength

      this.state.alter.room = 1
    }

    this.submit = this.submit.bind(this)
  }

  componentDidMount () {
    if (!this.props.blank) {
      fetch(`/api/user/${this.props.data.creator}/name`, {
        method: 'GET'
      })
        .then(postFetch)
        .then((creator) => creator.json())
        .then((creator) => this.setState({ creator }))
        .catch(this.props.onError)
    }

    fetch('/api/room/count', {
      method: 'GET'
    })
      .then(postFetch)
      .then((count) => count.json())
      .then((count) => this.setState({ roomCount: count }))
      .catch(this.props.onError)
  }

  render () {
    const start = new Date(this.state.alter.startdate || this.state.data.startdate)
    const end = new Date(start.getTime() + (this.state.alter.length || this.state.data.length))

    return (
      <div className='meeting-card editing'>
        <div className='header'>
          <input
            className='title'
            placeholder={this.state.data.title || 'Title'}
            value={this.state.alter.title || ''}
            maxLength={MeetingEditor.maxLengths.title}
            onChange={this.onChange.bind(this, 'title')}/>
        </div>

        <div className='subheader'>
          <input
            type='date'
            className='date'
            value={this.dateToDate(start)}
            onChange={this.onChange.bind(this, 'date')}/>

          <input
            type='time'
            className='starttime'
            value={this.dateToTime(start)}
            onChange={this.onChange.bind(this, 'starttime')}/>

          <span className='dash'>&#x2e3a;</span>

          <input
            type='time'
            className='endtime'
            placeholder={this.state.data.length || 'Meeting length'}
            value={this.dateToTime(end)}
            onChange={this.onChange.bind(this, 'endtime')}/>
        </div>

        <textarea
          className='description'
          placeholder={this.state.data.desc || 'No description'}
          value={this.state.alter.desc || ''}
          maxLength={MeetingEditor.maxLengths.desc}
          onChange={this.onChange.bind(this, 'desc')}/>

        <div className='room-container'>
          {new Array(this.state.roomCount).fill(null).map((r, i) => (
            <button
              className={`btn room-button${(((this.state.alter.room || this.state.data.room) - 1 || 0) === i ? ' active' : '')}`}
              key={i}
              onClick={this.onChange.bind(this, 'room', i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {this.props.blank
          ? null
          : (
            <div className='footer'>
              <span className='creator'>{this.state.creator
                ? `${this.state.creator.firstname} ${this.state.creator.lastname}`
                : this.props.data.creator}</span>
            </div>
            )}

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
    )
  }

  onChange (prop, event) {
    const start = new Date(this.state.alter.startdate || this.state.data.startdate)

    let field
    let value

    switch (prop) {
      case 'date':
        field = 'date'
        value = event.target.value + 'T' + this.dateToTime(start)
        break
      case 'starttime':
        field = 'startdate'
        value = this.dateToDate(start) + 'T' + event.target.value
        break
      case 'endtime':
        field = 'length'
        value = Math.max(MeetingEditor.minLength, new Date(this.dateToDate(start) + 'T' + event.target.value).getTime() - start.getTime())
        break
      case 'room':
        field = prop
        value = event
        break
      default:
        field = prop
        value = event.target.value
        break
    }

    this.setState({
      alter: {
        ...this.state.alter,
        [field]: value
      }
    })

    this.props.onChange?.({
      ...this.state.alter,
      [field]: value
    })
  }

  submit () {
    fetch('/api/meeting/' + this.state.data.id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.auth
      },
      body: JSON.stringify(this.state.alter)
    })
      .then(postFetch)
      .then(() => this.props.onSave?.({
        ...this.state.data,
        ...this.state.alter
      }))
      .catch(this.props.onError)
  }

  dateToDate (date) {
    return `${date.getFullYear()}-${this.formatNumber(date.getMonth() + 1)}-${this.formatNumber(date.getDate())}`
  }

  dateToTime (date) {
    return `${this.formatNumber(date.getHours())}:${this.formatNumber(date.getMinutes())}`
  }

  formatNumber (num) {
    return num.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })
  }
}

export default MeetingEditor
