import React from 'react'

import MeetingStrip from './modules/MeetingStrip.jsx'
import MeetingEditor from './modules/MeetingEditor.jsx'
import room from '../assets/images/conference-horiz.jpg'
import postFetch from './util/postFetch.js'

import './styles/Manager.css'

class Manager extends React.Component {
  state = {
    meetings: [],
    creating: null,
    invalid: {},
    locked: false
  }

  creatingRef = React.createRef()

  constructor (props) {
    super(props)

    this.updateMeetings = this.updateMeetings.bind(this)
    this.toggleCreate = this.toggleCreate.bind(this)
    this.onChange = this.onChange.bind(this)
    this.submit = this.submit.bind(this)
  }

  componentDidMount () {
    this.updateMeetings()
  }

  render () {
    return (
      <div className='app-container manager' style={{ backgroundImage: `url(${room})` }}>
        <div className='content'>
          <h1>My Meetings</h1>

          <div className='meeting-container'>
            {this.state.meetings.length
              ? this.state.meetings.map((m) => <MeetingStrip
                data={m}
                editable={true}
                key={m.id}
                onError={this.props.onError}
                onDelete={this.updateMeetings}
              />)
              : <span className='floating-text'>No meetings scheduled</span>}
          </div>

          <button
            className='create'
            onClick={this.toggleCreate.bind(this)}
          >
            Schedule
          </button>
        </div>

        {this.state.creating
          ? (
            <div className='create modal'>
              <div className='modal-dialogue'>
                <div className='modal-header'>
                  <h5 className='modal-title'>Schedule Meeting</h5>
                </div>

                <div className='modal-body'>
                  <MeetingEditor ref={this.creatingRef} blank={true} onChange={this.onChange} onSubmit={this.submit} invalid={this.state.invalid}/>
                </div>

                <div className='modal-footer'>
                  <button className='btn btn-success' onClick={this.submit} disabled={this.state.locked}>Create</button>

                  <button className='btn btn-secondary' onClick={this.toggleCreate}>Cancel</button>
                </div>
              </div>
            </div>
            )
          : null}
      </div>
    )
  }

  updateMeetings () {
    return fetch('/api/meeting/list/self', {
      method: 'GET',
      headers: {
        Authorization: localStorage.auth
      }
    })
      .then(postFetch)
      .then((meetings) => meetings.json())
      .then((meetings) => this.setState({ meetings }))
      .catch(this.props.onError)
  }

  toggleCreate () {
    this.setState({
      creating: this.state.creating ? null : {},
      invalid: {}
    })
  }

  onChange (data) {
    this.setState({
      creating: {
        ...this.state.creating,
        ...data
      }
    })
  }

  submit (e) {
    e.preventDefault()

    this.setState({
      locked: true
    })

    if (this.state.creating?.title?.length) {
      return fetch('/api/meeting/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.auth
        },
        body: JSON.stringify(this.state.creating)
      })
        .then(postFetch)
        .then(() => {
          this.toggleCreate()
          this.updateMeetings()
        })
        .catch(this.creatingRef.current.validate)
        .finally(() => this.setState({ locked: false }))
    } else {
      this.setState({
        locked: false,
        invalid: {
          title: 'Required Field'
        }
      })
    }
  }
}

export default Manager
