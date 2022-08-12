import React from 'react'

import postFetch from './util/postFetch.js'
import MeetingCard from './modules/MeetingCard.jsx'
import Clock from './modules/Clock.jsx'
import room from '../assets/images/conference-horiz.jpg'

import './styles/Schedule.css'

class Schedule extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      rooms: []
    }
  }

  componentDidMount () {
    return fetch('/api/room/count', {
      method: 'GET'
    })
      .then(postFetch)
      .then((count) => count.json())
      .then((count) => {
        const rooms = new Array(count).fill(undefined)

        this.update(rooms)

        this.updateInterval = setInterval(this.update.bind(this, rooms), 300000 /* 5 minutes */)
      })
      .catch(this.props.onError)
  }

  componentWillUnmount () {
    clearInterval(this.updateInterval)
  }

  render () {
    return (
      <div className='app-container schedule' style={{ backgroundImage: `url(${room})` }}>
        <div className='clock-container'>
          <Clock className='clock' format='h:mma' interval={30000} ticking={true}/>
        </div>

        <div className='content'>
          {this.state.rooms.map((r, i) => (
            <div className='meeting-list-container' key={i}>
              <div className='room-id-label'>Room {i + 1}</div>

              {r.length
                ? (
                  <div className='meeting-list'>
                    {r.map((m) => <MeetingCard onError={this.props.onError} data={m} key={m.id}/>)}
                  </div>
                  )
                : <div className='floating-text'>No upcoming meetings</div>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  update (rooms) {
    return Promise.all(rooms.map((r, i) => fetch('/api/room/list/' + (i + 1), {
      method: 'GET',
      headers: {
        Authorization: localStorage.getItem('auth')
      }
    })
      .then(postFetch)
      .then((meetings) => meetings.json())))

      .then((rooms) => this.setState({ rooms }))
      .catch(this.props.onError)
  }
}

export default Schedule
