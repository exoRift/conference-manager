import React from 'react'

import postFetch from '../util/postFetch.js'

import '../styles/MeetingCard.css'
import '../styles/MeetingEditor.css'

class MeetingEditor extends React.Component {
  static defaultProps = {
    data: {},
    invalid: {},
    blank: false
  }

  static maxLengths = {
    title: 45,
    desc: 150
  }

  static overlapRegex = /{(.+)}.*{(.+)}.*{(.+)}/
  static lengthRegex = /{(.+)}/

  static defaultLength = 3600000 /* 1 hour */
  static minLength = 900000 /* 15 minutes */

  constructor (props) {
    super(props)

    this.state = {
      data: props.data,
      alter: {},
      creator: {},
      invalid: {},
      roomCount: 0
    }

    if (props.blank) {
      this.state.alter.startdate = new Date()
      this.state.alter.startdate.setSeconds(0)
      this.state.alter.startdate.setMilliseconds(0)

      this.state.alter.length = MeetingEditor.defaultLength

      this.state.alter.room = 1
    }

    this.validate = this.validate.bind(this)
    this.submit = this.submit.bind(this)

    this.onSubmit = this.props.onSubmit || this.submit
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
      <form className='meeting-card editing' onSubmit={(e) => this.props.onSubmit?.(e, this.validate) || this.submit(e)}>
        <div className='form-group header'>
          <input
            className={`form-control title${this.state.invalid.title || this.props.invalid.title
              ? ' is-invalid'
              : ''}`}
            placeholder={this.state.data.title || 'Title'}
            value={this.state.alter.title || ''}
            maxLength={MeetingEditor.maxLengths.title}
            onChange={this.onChange.bind(this, 'title')}/>
          {this.state.invalid.title || this.props.invalid.title
            ? <div className='invalid-feedback'>{this.state.invalid.title || this.props.invalid.title}</div>
            : null}
        </div>

        <div className='form-group subheader'>
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
        {this.state.invalid.date || this.props.invalid.date
          ? <div className='invalid-feedback'>{this.state.invalid.date || this.props.invalid.date}</div>
          : null}

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
              type='button'
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
              type='submit'
            >
                Save
            </button>
            )}
      </form>
    )
  }

  onChange (prop, e) {
    e?.preventDefault?.()

    const start = new Date(this.state.alter.startdate || this.state.data.startdate)

    let field
    let value

    switch (prop) {
      case 'date':
        if (e.target.value) {
          const [year, month, day] = e.target.value.split('-')

          field = 'startdate'

          start.setFullYear(year)
          start.setMonth(month)
          start.setDate(day)
          value = start
        }
        break
      case 'starttime':
        if (e.target.value) {
          const [hours, minutes] = e.target.value.split(':')

          field = 'startdate'

          start.setHours(hours)
          start.setMinutes(minutes)
          value = start
        }
        break
      case 'endtime':
        if (e.target.value) {
          const [hours, minutes] = e.target.value.split(':')

          field = 'length'

          const end = new Date(start)
          end.setHours(hours)
          end.setMinutes(minutes)
          value = Math.max(MeetingEditor.minLength, end.getTime() - start.getTime())
        }
        break
      case 'room':
        field = prop
        value = e
        break
      default:
        field = prop
        value = e.target.value
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

  validate (res) {
    if (res instanceof TypeError) return this.props.onError(res) // Network errors
    else {
      return res.json()
        .then(({ error }) => {
          if (error.message === 'title taken') {
            this.setState({
              invalid: {
                title: 'Title taken by another meeting'
              }
            })
          } else if (error.message.includes('overlap')) {
            const [, title, start, end] = error.message.match(MeetingEditor.overlapRegex)
            const startdate = new Date(start)
            const enddate = new Date(end)

            this.setState({
              invalid: {
                date: `Your meeting overlaps [${title}] which is in session from ${startdate.toLocaleString('en-US', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })} to ${enddate.toLocaleTimeString('en-US', {
                  timeStyle: 'short'
                })}`
              }
            })
          } else if (error.message.includes('longer')) {
            const [, max] = error.message.match(MeetingEditor.lengthRegex)

            this.setState({
              invalid: {
                date: 'Meeting cannot be longer than ' + max
              }
            })
          } else return this.props.onError(error)
        })
    }
  }

  submit (e) {
    e.preventDefault()

    return fetch('/api/meeting/' + this.state.data.id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.auth
      },
      body: JSON.stringify(this.state.alter)
    })
      .then(postFetch)
      .then(() => this.props.onSuccess?.({
        ...this.state.data,
        ...this.state.alter
      }))
      .catch(this.validate)
  }

  dateToDate (date) {
    return `${date.getFullYear()}-${this.formatNumber(date.getMonth())}-${this.formatNumber(date.getDate())}`
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
