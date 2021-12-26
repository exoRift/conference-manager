import React from 'react'

import postFetch from '../util/postFetch.js'

import '../styles/MeetingCard.css'

const {
  REACT_APP_API_URL
} = process.env

class MeetingCard extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      creator: null
    }
  }

  componentDidMount () {
    return fetch(`${REACT_APP_API_URL}/user/${this.props.data.creator}/name`, {
      method: 'GET'
    })
      .then(postFetch)
      .then((creator) => creator.json())
      .then((creator) => this.setState({ creator }))
      .catch(this.props.onError)
  }

  render () {
    const start = new Date(this.props.data.startdate)
    const end = new Date(start.getTime() + this.props.data.length)

    return (
      <div className={`meeting-card ${start - Date.now() <= 3600000 /* One hour */
        ? 'soon'
        : ''} ${start < Date.now()
        ? 'in-session'
        : ''}`}>
        <div className='header'>
          <strong className='title'>{this.props.data.title}</strong>
        </div>
        <div className='subheader'>
          <span className='date'>{start.toLocaleDateString('en-US', {
            dateStyle: 'short'
          })}</span>

          <span className='time-container'>
            <span className='starttime'>{start.toLocaleTimeString('en-US', {
              timeStyle: 'short'
            })}</span>

            <span className='dash'>&#x2e3a;</span>

            <span className='endtime'>{end.toLocaleTimeString('en-US', {
              timeStyle: 'short'
            })}</span>
          </span>
        </div>
        <div className='content'>
          <div className={`description ${this.props.data.desc ? 'filled' : 'empty'}`}>{this.props.data.desc || 'No description provided'}</div>

          {this.props.data.attendees.length
            ? <div className='attendees'>{this.props.data.attendees.map((a, i) => <span className='attendee' key={i}>{a}</span>)}</div>
            : null}
        </div>
        <div className='footer'>
          <span className='creator'>{this.state.creator
            ? `${this.state.creator.firstname} ${this.state.creator.lastname}`
            : this.props.data.creator}</span>
        </div>
      </div>
    )
  }
}

export default MeetingCard
