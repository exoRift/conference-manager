import React from 'react'

import postFetch from './util/postFetch.js'
import MeetingCard from './modules/MeetingCard.jsx'
import Clock from './modules/Clock.jsx'
import room from '../assets/images/conference-horiz.jpg'

import './styles/Directory.css'

class Directory extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      rooms: [],
      tenants: [],
      touchscreen: false,
      entities: this.props.query.page === 'entities'
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

    if ('toggleInterval' in this.props.query) {
      const interval = parseInt(this.props.query.toggleInterval)

      if (!isNaN(interval)) this.toggleInterval = setInterval(this.togglePage.bind(this), interval)
    }
  }

  componentWillUnmount () {
    this.scrollInterval = clearInterval(this.scrollInterval)
    this.updateInterval = clearInterval(this.updateInterval)
    this.toggleInterval = clearInterval(this.toggleInterval)

    window.removeEventListener('touchstart', this.setTouch)
    window.removeEventListener('touchend', this.setTouch)
  }

  render () {
    console.log(this.state)
    if (this.state.touchscreen || this.rails.reduce((a, r) => a ||
      (r.current?.clientWidth < r.current?.scrollWidth), false)) this.scrollInterval = clearInterval(this.scrollInterval)
    else if (!this.scrollInterval) this.scrollInterval = setInterval(this.autoScroll, 3000)

    return (
      <div className='app-container directory' style={{ backgroundImage: `url(${room})` }}>
        {this.props.query.ui === 'false'
          ? null
          : (
            <button className='btn btn-outline-info page-switch' onClick={() => this.setState({ entities: !this.state.entities })}>
              {this.state.entities ? 'Meetings' : 'Tenants'}
            </button>
            )}

        {this.state.entities
          ? (
            <div className='suite-list-container'>
              <div className='suite-list' style={{ gridTemplateColumns: `repeat(${Math.ceil(this.state.tenants.length / 2)}, 1fr)` }}>
                {this.state.tenants.map((t, i) => (
                  <div className='tenant-card' key={i}>
                    <div className='header'>
                      <span>{t.suite}</span>
                    </div>

                    <div className='body'>
                      <span>{t.entity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )
          : this.state.rooms.map((r, i) => (
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

        {'toggleInterval' in this.props.query
          ? (
            <div className='progress'>
              <div id='progbar' className='progress-bar bg-info' role='progressbar' style={{
                animationDuration: this.props.query.toggleInterval + 'ms'
              }}/>
            </div>
            )
          : null}
      </div>
    )
  }

  async update (rooms) {
    await Promise.all(rooms.map((r, i) => fetch('/api/room/list/' + (i + 1), {
      method: 'GET'
    })
      .then(postFetch)
      .then((meetings) => meetings.json())))

      .then((rooms) => this.setState({ rooms }))
      .catch(this.props.onError)

    await fetch('/api/suite/list', {
      method: 'GET'
    })
      .then(postFetch)
      .then((tenants) => tenants.json())
      .then((tenants) => this.setState({ tenants }))
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

  togglePage () {
    const bar = document.getElementById('progbar')
    const clone = bar.cloneNode(true)

    bar.parentNode.replaceChild(clone, bar)

    this.setState({
      entities: !this.state.entities
    })
  }
}

export default Directory
