import React from 'react'
import {
  parse as parseQuery
} from 'query-string'

import './styles/Room.css'

import {
  getConfStatus
} from './util/'

const {
  REACT_APP_API_URL
} = process.env

class Room extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      next: null,
      upcoming: null,
      invalid: false
    }

    this.params = parseQuery(window.location.search)
  }

  componentDidMount () {
    this.tick(this.params.room)

    this.dbTimer = setInterval(() => this.tick(this.params.room), 60000)
  }
  
  componentWillUnmount () {
    clearInterval(this.dbTimer)
  }

  tick (room) {
    fetch(REACT_APP_API_URL + '/room?room=' + room).then((data) => {
      if (data.status === 200) {
        data.json().then(({ next, upcoming }) => {
          this.setState({
            selected: true,
            next,
            upcoming
          })
        })
      } else {
        this.setState({
          selected: true,
          invalid: true
        })
      }
    })
  }

  render () {
    if (this.state.invalid) {
      return (
        <div className='invalidRoomContainer'>
          <font className='invalidRoomText'>Invalid Room Selected</font>
        </div>
      )
    } else if (this.state.next) {
      const startDate = new Date(this.state.next.starttime)

      return (
        <>
          <div className='roomCard' id={getConfStatus(this.state.next)}>
            <div className='head'>
              <h1 className='title'>{this.state.next.title}</h1>
            </div>
            <div className='body'>
              <div className='roomNumberContainer'>
                <h5>Conference Room: </h5>
                <h5 className='roomNumber'>{this.state.next.room}</h5>
              </div>
              <div className='chronals'>
                <h6 className='time'>{startDate.toLocaleTimeString('en-US', { timeStyle: 'short' })}
                  - {new Date(this.state.next.endtime).toLocaleTimeString('en-US', { timeStyle: 'short' })}</h6>
                <h6 className='date'>{startDate.toDateString().slice(0, -(String(startDate.getFullYear()).length + 1))}</h6>
              </div>
              <div className='divider'/>
              <h4 className='description'>{this.state.next.desc}</h4>
              <div className='attendeesContainer'>
                <h5>Attendees:</h5>
                <div className='attendees'>
                  <h6>{this.state.next.attendees.reduce((a, at) => `${a}${a ? ', ' : ''}${at}`, '')}</h6>
                </div>
              </div>
            </div>
          </div>
  
          {this.state.upcoming
            ? (
              <div className='upcomingConfContainer'>
                <h2>Up next:</h2>
                <h2 className='upcomingConfTitle'>{this.state.upcoming.title}</h2>
              </div>
            )
            : undefined}
        </>
      )
    } else {
      return (
        <div className='emptyMessageContainer'>
          <strong className='emptyMessage'>No scheduled conferences</strong>
        </div>
      )
    }
  }
}

export default Room
