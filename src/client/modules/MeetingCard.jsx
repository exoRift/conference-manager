import React from 'react'

import postFetch from '../util/postFetch.js'

import '../styles/MeetingCard.css'

class MeetingCard extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      creator: null
    }
  }

  componentDidMount () {
    return fetch(`/api/user/${this.props.data.creator}/name`, {
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
        : ''}`}
      >
        <div className='header'>
          <strong className='title'>{this.props.data.title}</strong>
        </div>

        <div className='subheader'>
          <strong className='date'>{start.toLocaleDateString('en-US', {
            dateStyle: 'short'
          })}</strong>

          <span className='times'>
            <span className='starttime'>{start.toLocaleTimeString('en-US', {
              timeStyle: 'short'
            })}</span>

            <span className='dash'>&#x2e3a;</span>

            <span className='endtime'>{end.toLocaleTimeString('en-US', {
              timeStyle: 'short'
            })}</span>
          </span>
        </div>

        <div className={`description ${this.props.data.desc ? 'filled' : 'empty'}`}>{this.props.data.desc || 'No description provided'}</div>

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
