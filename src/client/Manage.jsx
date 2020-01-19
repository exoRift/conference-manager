import React from 'react'
import {
  Redirect
} from 'react-router-dom'
import DatePicker from 'react-datetime'

import ConferenceManager from './util/ConferenceManager.jsx'
import AttendeesInput from './util/AttendeesInput.jsx'

import plusIcon from '../assets/plus.png'

import './styles/Manage.css'
import moment from 'moment'

const momentDateFormat = 'MMM DD YYYY,'
const momentTimeFormat = 'h:mm a'

class Manage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      adding: null,
      error: null,
      saving: false
    }

    this.addConf = this.addConf.bind(this)
    this.cancelAdd = this.cancelAdd.bind(this)
    this.addChange = this.addChange.bind(this)
    this.addDateChange = this.addDateChange.bind(this)
    this.onCreate = this.onCreate.bind(this)

    this._refs = {
      confs: React.createRef()
    }
  }

  addConf () {
    this.setState({
      adding: {
        starttime: moment(),
        endtime: moment()
      }
    })
  }

  cancelAdd () {
    this.setState({
      adding: null,
      error: null
    })
  }

  addChange (event) {
    if (event.target.id === 'room' && event.target.value.length > 1) return

    this.setState({
      adding: {
        ...this.state.adding,
        [event.target.id]: event.target.value
      }
    })
  }

  addDateChange (prop) {
    return (event) => {
      this.setState({
        adding: {
          ...this.state.adding,
          [prop]: event
        }
      })
    }
  }

  onCreate () {
    this.setState({
      saving: true
    })

    return this._refs.confs.current.create(this.state.adding)
      .then(() => {
        this.setState({
          adding: null,
          error: null,
          saving: false
        })
      })
      .catch((err) => {
        this.setState({
          error: err.message[0].toUpperCase() + err.message.substring(1),
          saving: false
        })
      })
  }

  render () {
    return localStorage.getItem('auth') ? (
      <div className='ownedConfContainer'>
        <ConferenceManager ref={this._refs.confs}/>

        <div className='addContainer' onClick={this.addConf}>
          <div className='plus'>
            <img src={plusIcon} alt='plus'/>
          </div>
        </div>

        <div className='submitContainer'>
          <button onClick={() => this._refs.confs.current.onSubmit()}>Save changes</button>
        </div>

        {this.state.adding ? (
          <div className='addConfContainer' id='popup'>
            <div className='closeContainer' onClick={this.cancelAdd}>
              <div className='closeButton'>
                <div className='xContainer'>
                  <span>X</span>
                </div>
              </div>
            </div>

            <div className='messageContainer'>
              <h1>Create a conference</h1>
            </div>

            <div className='inputContainer'>
              <div className='inputBox title'>
                <h3>Title</h3>
                <input value={this.state.adding.title || ''} onChange={this.addChange} id='title'/>
              </div>

              <div className='inputBox room'>
                <h3>Room</h3>
                <input value={this.state.adding.room || ''} onChange={this.addChange} id='room'/>
              </div>

              <div className='inputBox desc'>
                <h3>Description</h3>
                <input value={this.state.adding.desc || ''} onChange={this.addChange} id='desc'/>
              </div>

              <div className='inputBox attendees'>
                <h3>Attendees</h3>
                <AttendeesInput
                  attendees={[]}
                  users={this._refs.confs.current.state.users || []}
                  onChange={this.addChange}
                />
              </div>

              <div className='inputBox starttime'>
                <h3>Start Time</h3>
                <DatePicker
                  value={this.state.adding.starttime || new Date()}
                  local='en-US'
                  dateFormat={momentDateFormat}
                  timeFormat={momentTimeFormat}
                  onChange={this.addDateChange('starttime')}
                />
              </div>

              <div className='inputBox endtime'>
                <h3>End Time</h3>
                <DatePicker
                  value={this.state.adding.endtime || new Date()}
                  local='en-US'
                  dateFormat={momentDateFormat}
                  timeFormat={momentTimeFormat}
                  onChange={this.addDateChange('endtime')}
                />
              </div>
            </div>

            <div className='submitContainer'>
              <button onClick={this.state.saving ? null : this.onCreate} id={this.state.saving ? 'saving' : 'ready'}>Create</button>
            </div>

            {this.state.error ? (
              <div className='savingError'>
                <span className='header'>Error:</span>
                <span className='message'>{this.state.error}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    ) : (
      <Redirect to='/'/>
    )
  }
}

export default Manage
