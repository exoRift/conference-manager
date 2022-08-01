import React from 'react'

import postFetch from './util/postFetch.js'
import MeetingCard from './modules/MeetingCard.jsx'
import Clock from './modules/Clock.jsx'
import Picker from './modules/Picker.jsx'
import room from '../assets/images/conference-vert.jpg'

import './styles/RoomPanel.css'

const pickerColumns = [
  {
    title: 'Hour',
    type: 'numerical',
    range: [0, 4]
  },
  {
    title: 'Minute',
    type: 'numerical',
    range: [0, 59]
  }
]

class RoomPanel extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      meetings: [],
      reserving: false,
      custom: false,
      extending: false,
      expanded: false
    }

    props.match.params.room = parseInt(props.match.params.room)

    this.refreshes = []
    this.customTime = [0, 0]

    this.update = this.update.bind(this)
    this.setCustom = this.setCustom.bind(this)
    this.toggleExpand = this.toggleExpand.bind(this)
    this._postReserve = this._postReserve.bind(this)
    this._cancelGesture = this._cancelGesture.bind(this)
  }

  componentDidMount () {
    this.update()

    document.addEventListener('gesturestart', this._cancelGesture)

    this.updateInterval = setInterval(this.update, 300000 /* 5 minutes */)
  }

  componentWillUnmount () {
    document.removeEventListener('gesturestart', this._cancelGesture)

    clearInterval(this.updateInterval)
    clearTimeout(this.cancelReserveTimeout)
    clearTimeout(this.expandTimeout)

    for (const refresh of this.refreshes) clearTimeout(refresh)
  }

  render () {
    const ongoing = this.state.meetings.find((m) => {
      const start = new Date(m.startdate)

      return start < Date.now()
    })

    const upcoming = this.state.meetings.filter((m) => {
      const start = new Date(m.startdate)
      const today = new Date()

      return start > Date.now() && start.getMonth() === today.getMonth() && start.getDate() === today.getDate()
    })

    return (
      <div className='app-container room-panel' style={{ backgroundImage: `url(${room})` }}>
        <div className='header'>{'Conference Room ' + this.props.match.params.room}</div>
        <div className={`current ${ongoing ? 'occupied' : 'vacant'}${this.state.reserving ? ' scheduling' : ''}${this.state.custom ? ' custom' : ''}`}>
          <strong className='subheader'>{ongoing ? 'Occupied' : 'Vacant'}</strong>
          {ongoing || upcoming.length
            ? (
              <div className='subheader-comments'>
                <span className='inline comment until'>{'- Until ' + new Date(ongoing
                  ? new Date(ongoing.startdate).getTime() + ongoing.length
                  : upcoming[0].startdate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>

                {ongoing
                  ? <span className='comment countdown'>
                    {'- Time Remaining: '}
                    <Clock format={'HH:mm:ss'} countdown={new Date(new Date(ongoing.startdate).getTime() + ongoing.length)}/>
                  </span>
                  : null}
              </div>
              )
            : null}

          {ongoing && !this.state.reserving
            ? <MeetingCard onError={this.props.onError} data={ongoing}/>
            : null}

          <div className='button-container'>
            {this.state.reserving
              ? (
                <>
                  <div className='length-container'>
                    {this.state.custom
                      ? (
                        <>
                          <Picker columns={pickerColumns} onUpdate={this.setCustom}/>

                          <button
                            className='btn btn-success time-option submit'
                            onClick={() => this.reserve((this.state.extending ? ongoing.length : 0) +
                              ((this.customTime[0] + (this.customTime[1] / 60)) * 3600000), ongoing?.id)}>
                            {this.state.extending ? 'Extend' : 'Reserve'}
                          </button>
                        </>
                        )
                      : new Array(4).fill(undefined).map((e, i) => { // Quick time options
                        const factor = (i + 1) * 0.5
                        const hours = Math.floor(factor)
                        const minutes = (factor - hours) * 60

                        return (
                          <button
                            className='btn btn-outline-primary time-option'
                            onClick={() => this.reserve((this.state.extending ? ongoing.length : 0) + (factor * 3600000), ongoing?.id)}
                            disabled={(this.state.extending ? ongoing.length / 3600000 : 0) + factor /* 1 hour */ > 4 /* 4 hours */}
                            key={i}>
                            {`${hours}:${minutes.toLocaleString('en-US', {
                                minimumIntegerDigits: 2
                            })}`}
                          </button>
                        )
                      })}

                    <button className='btn btn-danger time-option' onClick={() => this.setStatus(false)}>Cancel</button>
                    {this.state.custom
                      ? <button className='btn btn-outline-primary time-option' onClick={() => this.setStatus(true, false)}>Quick Options</button>
                      : <button className='btn btn-outline-primary time-option' onClick={() => this.setStatus(true, true)}>Custom</button>}
                  </div>
                </>
                )
              : ongoing
                ? ongoing.limited
                  ? (
                    <div className='limited-container'>
                      <button className='btn btn-outline-danger cancel' onClick={() => this.cancel(ongoing.id)}>Cancel</button>
                      <button className='btn btn-outline-primary extend' onClick={() => this.setStatus(true, false, true)}>Extend</button>
                    </div>
                    )
                  : null
                : <button className='btn btn-outline-primary book' onClick={() => this.setStatus(true)}>Reserve</button>}
          </div>
        </div>

        <div
          className={`upcoming${upcoming.length ? '' : ' none'}${this.state.expanded ? ' expanded' : ''}`}
          onClick={upcoming.length ? this.toggleExpand : null}>
          {upcoming.length
            ? this.state.expanded
              ? (
                <div className='upcoming-list-container'>
                  {upcoming.map((m, i) => {
                    const start = new Date(m.startdate)
                    const end = new Date(start.getTime() + m.length)

                    return (
                      <div className='upcoming-entry' key={i}>
                        <strong className='title'>{m.title}</strong>

                        <span className='date'>{start.toLocaleDateString('en-US', {
                          dateStyle: 'short'
                        })}</span>

                        <span className='time-container'>
                          <span className='starttime'>{start.toLocaleTimeString('en-US', {
                            timeStyle: 'short'
                          })}</span>

                          <span className='dash'>&#8212;</span>

                          <span className='endtime'>{end.toLocaleTimeString('en-US', {
                            timeStyle: 'short'
                          })}</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
                )
              : <strong className='title'>{upcoming[0].title}</strong>
            : <span>No upcoming scheduled bookings today</span>}
        </div>
      </div>
    )
  }

  update () {
    for (const refresh of this.refreshes) clearTimeout(refresh)

    return fetch('/api/room/list/' + this.props.match.params.room, {
      method: 'GET'
    })
      .then(postFetch)
      .then((meetings) => meetings.json())
      .then((meetings) => {
        this.refreshes = meetings.reduce((a, m, i) => {
          if (i) a.push(setTimeout(this.update, new Date(m.startdate).getTime() - Date.now()))
          else a.push(setTimeout(this.update, m.length))

          return a
        }, [])

        this.setState({
          meetings,
          expanded: meetings.length ? this.state.expanded : false
        })
      })
      .catch(this.props.onError)
  }

  setStatus (reserving, custom, extending) {
    this.setState({
      reserving,
      custom: reserving ? custom ?? this.state.custom : false,
      extending: reserving ? extending ?? this.state.extending : false
    })

    clearTimeout(this.cancelReserveTimeout)
    if (reserving) this.cancelReserveTimeout = setTimeout(() => this.setStatus(false), 60000)
  }

  _postReserve (res) {
    if (res.ok) this.update()

    this.setStatus(false)
  }

  reserve (length, editID) {
    if ('auth' in localStorage) {
      if (this.state.extending) {
        fetch('/api/meeting/' + editID, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.auth
          },
          body: JSON.stringify({
            length
          })
        })
          .then(postFetch)
          .then(this._postReserve)
          .catch(this.props.onError)
      } else {
        fetch('/api/meeting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.auth
          },
          body: JSON.stringify({
            title: 'Manually Reserved',
            length,
            room: this.props.match.params.room
          })
        })
          .then(postFetch)
          .then(this._postReserve)
          .catch(this.props.onError)
      }
    } else {
      this.props.onError({
        message: 'This panel is not logged in and cannot properly reserve a meeting. Please contact a building administrator'
      })
    }
  }

  cancel (id) {
    return fetch('/api/meeting/' + id, {
      method: 'DELETE',
      headers: {
        Authorization: localStorage.auth
      }
    })
      .then(postFetch)
      .then(this.update)
      .catch(this.props.onError)
  }

  setCustom (columns) {
    this.customTime = columns
  }

  toggleExpand () {
    clearTimeout(this.expandTimeout)

    if (this.state.expanded) {
      this.setState({
        expanded: false
      })
    } else {
      this.expandTimeout = setTimeout(this.toggleExpand, 20000)

      this.setState({
        expanded: true
      })
    }
  }

  _cancelGesture (e) {
    e.preventDefault()
  }
}

export default RoomPanel
