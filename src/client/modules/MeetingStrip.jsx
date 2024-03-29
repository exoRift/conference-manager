import React from 'react'

import postFetch from '../util/postFetch.js'
import MeetingEditor from './MeetingEditor.jsx'

import '../styles/MeetingStrip.css'

const {
  REACT_APP_LOCATION
} = process.env

class MeetingStrip extends React.Component {
  static dateDelimRegex = /-|:|\./g

  constructor (props) {
    super(props)

    this.state = {
      data: props.data,
      creator: '',
      editing: false,
      deleting: false,
      saved: false,
      shared: false
    }

    this.toggleEditing = this.toggleEditing.bind(this)
    this.onSuccess = this.onSuccess.bind(this)
    this.onShare = this.onShare.bind(this)
  }

  componentDidMount () {
    fetch(`/api/user/${this.props.data.creator}/name`, {
      method: 'GET'
    })
      .then(postFetch)
      .then((creator) => creator.json())
      .then((creator) => this.setState({ creator }))
      .catch(this.props.onError)
  }

  componentWillUnmount () {
    clearTimeout(this.saveTimeout)
    clearTimeout(this.shareTimeout)
  }

  render () {
    const start = new Date(this.state.data.startdate)
    const end = new Date(new Date(this.state.data.startdate).getTime() + this.state.data.length)

    return (
      <div className={`meeting-strip${start - Date.now() <= 3600000 /* One hour */
        ? ' soon'
        : ''}${start < Date.now()
        ? ' in-session'
        : ''} ${this.state.editing ? ' editing' : ''} ${this.state.saved ? ' saved' : ''}`}>
        <div className='info-container'>
          {this.props.editable
            ? <div
              className={`btn material-symbols-outlined edit${this.state.editing ? ' editing' : ''}`}
              alt='edit'
              onClick={this.toggleEditing}
              >
                edit
              </div>
            : null}

          <span className={`material-symbols-outlined share${this.state.shared ? ' active' : ''}`} title='Share' onClick={this.onShare}>
            share
          </span>

          {this.state.editing
            ? <MeetingEditor data={this.state.data} onSuccess={this.onSuccess} onError={this.props.onError}/>
            : (
              <>
                <span className='title'>{this.state.data.title}</span>

                <span className='time-container'>
                  <span className='date'>{start.toLocaleDateString('en-US', {
                    dateStyle: 'short'
                  })}</span>

                  <span className='times'>
                    <span className='starttime'>{start.toLocaleTimeString('en-US', {
                      timeStyle: 'short'
                    })}</span>

                    <span className='dash'>&#x2e3a;</span>

                    <span className='endtime'>{end.toLocaleTimeString('en-US', {
                      timeStyle: 'short'
                    })}</span>
                  </span>
                </span>

                <span className='room'>{'Room ' + this.state.data.room}</span>
              </>
              )}
        </div>

        {this.state.editing
          ? null
          : (
            <div className='hover-info-container'>
              {this.state.deleting
                ? (
                  <span className='delete-confirm-container'>
                    <div className='btn material-symbols-outlined cancel' onClick={this.toggleDeleting.bind(this)}>
                      close
                    </div>
                    <div className='btn material-symbols-outlined confirm' onClick={this.delete.bind(this)}>
                      done
                    </div>
                  </span>
                  )
                : this.props.editable
                  ? <div className='btn material-symbols-outlined delete' onClick={this.toggleDeleting.bind(this)}>
                      delete
                    </div>
                  : null}

              <span className='creator'>{this.state.creator.firstname} {this.state.creator.lastname}</span>
            </div>
            )}
      </div>
    )
  }

  toggleEditing () {
    this.setState({
      editing: !this.state.editing,
      deleting: false
    })
  }

  toggleDeleting () {
    this.setState({
      deleting: !this.state.deleting
    })
  }

  onSuccess (data) {
    this.setState({
      editing: false,
      saved: true,
      data
    })

    clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => this.setState({ saved: false }), 300)
  }

  delete () {
    fetch('/api/meeting/' + this.state.data.id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.auth
      }
    })
      .then(postFetch)
      .then(this.props.onDelete)
      .catch(this.props.onError)
  }

  onShare () {
    this.setState({
      shared: true
    })

    navigator.clipboard.writeText(this.buildShareLink())

    clearTimeout(this.shareTimeout)
    this.shareTimeout = setTimeout(() => this.setState({ shared: false }), 400)
  }

  buildShareLink () {
    return 'https://www.google.com/calendar/render?action=TEMPLATE&text=' + this.state.data.title +
      '&details=' + (this.state.data.desc || '') +
      '&location=' + REACT_APP_LOCATION +
      '&dates=' + this.state.data.startdate.replace(MeetingStrip.dateDelimRegex, '') +
      '%2F' + new Date(new Date(this.state.data.startdate).getTime() + this.state.data.length).toISOString().replace(MeetingStrip.dateDelimRegex, '')
  }
}

export default MeetingStrip
