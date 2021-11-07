import React from 'react'

import postFetch from './util/postFetch.js'
import MeetingCard from './modules/MeetingCard.jsx'
import Clock from './modules/Clock.jsx'
import room from '../assets/images/conference-horiz.jpg'

import './styles/Directory.css'

const {
  REACT_APP_API_URL
} = process.env

class Directory extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      rooms: [],
      touchscreen: false
    }

    this.rails = [
      React.createRef(),
      React.createRef()
    ]

    this.autoScroll = this.autoScroll.bind(this)

    window.addEventListener('touchstart', this.setTouch.bind(this, true))
    window.addEventListener('touchend', this.setTouch.bind(this, false))
  }

  componentDidMount () {
    const rooms = new Array(2).fill(undefined)

    this.update(rooms)

    this.updateInterval = setInterval(this.update.bind(this, rooms), 300000 /* 5 minutes */)
  }

  componentWillUnmount () {
    this.scrollInterval = clearInterval(this.scrollInterval)

    window.removeEventListener('touchstart', this.setTouch)
    window.removeEventListener('touchend', this.setTouch)
  }

  render () {
    if (this.state.touchscreen || this.rails.reduce((a, r) => a ||
      (r.current?.clientWidth < r.current?.scrollWidth), false)) this.scrollInterval = clearInterval(this.scrollInterval)
    else if (!('scrollInterval' in this)) this.scrollInterval = setInterval(this.autoScroll, 3000)

    return (
      <div className='app-container directory' style={{ backgroundImage: `url(${room})` }}>
        {this.state.rooms.map((r, i) => (
          <div className='meeting-list-container' key={i}>
            <div className='room-id-label'>
              <span>{i + 1}</span>
            </div>

            {r.length
              ? (
                <div className='meeting-list' ref={this.rails[i]}>
                  {r.map((m, i) => <MeetingCard onError={this.props.onError} data={m} key={i}/>)}
                </div>
                )
              : <span className='floating-text'>No meetings scheduled</span>}
          </div>
        ))}

        <div className='clock-container'>
          <Clock className='clock' format='h:mma' interval={30000} ticking={true}/>
        </div>
      </div>
    )
  }

  update (rooms) {
    Promise.all(rooms.map((r, i) => fetch(REACT_APP_API_URL + '/room/list/' + (i + 1), {
      method: 'GET'
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

  setTouch (status) {
    for (const rail of this.rails) {
      if (rail.current) rail.current.style.overflow = status ? 'auto' : 'hidden'
    }

    this.setState({
      touchscreen: status
    })
  }
}

export default Directory
