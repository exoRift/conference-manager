import React from 'react'

import postFetch from './util/postFetch.js'
import MeetingCard from './modules/MeetingCard.jsx'
import Clock from './modules/Clock.jsx'
import room from '../assets/images/conference-horiz.jpg'

import './styles/Schedule.css'

class Directory extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      rooms: []
    }

    this.rails = [
      React.createRef(),
      React.createRef()
    ]

    this.autoScroll = this.autoScroll.bind(this)
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
        if (this.props.hideUI) this.scrollInterval = setInterval(this.autoScroll, 3000)
      })
      .catch(this.props.onError)
  }

  componentWillUnmount () {
    this.scrollInterval = clearInterval(this.scrollInterval)
    this.updateInterval = clearInterval(this.updateInterval)
  }

  render () {
    return (
      <div className='app-container directory' style={{ backgroundImage: `url(${room})` }}>
        <div className='clock-container'>
          <Clock className='clock' format='h:mma' interval={30000} ticking={true}/>
        </div>

        {this.state.rooms.map((r, i) => (
          <div className='meeting-list-container' key={i}>
            <div className='room-id-label'>{i + 1}</div>

            {r.length
              ? (
                <div className='meeting-list' ref={this.rails[i]}>
                  {r.map((m) => <MeetingCard onError={this.props.onError} data={m} key={m.id}/>)}
                </div>
                )
              : <span className='floating-text'>No upcoming meetings</span>}
          </div>
        ))}
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

  autoScroll () {
    for (const rail of this.rails) {
      if (rail.current?.clientWidth < rail.current?.scrollWidth && rail.current?.children.length > 1) {
        rail.current.scroll({
          left: rail.current.scrollLeft + rail.current.clientWidth >= rail.current.scrollWidth
            ? 0
            : rail.current.scrollLeft + rail.current.children[0].clientWidth + parseInt(window.getComputedStyle(rail.current.children[1]).marginLeft, 10),
          behavior: 'smooth'
        })
      }
    }
  }
}

export default Directory
