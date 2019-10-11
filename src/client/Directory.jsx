import React from 'react'

import Clock from './util/Clock.jsx'

import './styles/Directory.css'

import Banner from '../assets/banner.png'

import {
  getConfStatus
} from './util/'

const {
  REACT_APP_API_URL
} = process.env

class Directory extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      confs: []
    }
  }

  componentDidMount () {
    this.tick()

    this.dbTimer = setInterval(() => this.tick(), 60000)
  }

  componentWillUnmount () {
    clearInterval(this.dbTimer)
  }

  tick () {
    fetch(REACT_APP_API_URL + '/directory').then((data) => {
      data.json().then((confs) => this.setState({
        confs
      }))
    })
  }

  render () {
    if (this.state.confs.length > 12) {
      this.setState({
        confs: this.state.confs.reduce((a, c, i, arr) => {
          const dup = arr.findIndex((e) => e.room === c.room)

          if (dup !== -1) {
            if (arr[dup].starttime > c.starttime) arr[dup] = c
          } else a.push(c)

          return a
        }, [])
      })
    }

    return (
      <>
        <div id='head'>
          <div className='bannerContainer'>
            <img src={Banner} alt='Banner' className='banner'/>
          </div>

          <div className='clockContainer'>
            <Clock className='clock'/>
          </div>
        </div>

        {this.state.confs.length
          ? (
            <div className='conferenceCardContainer'>
              {this.state.confs.map((c) => {
                const startDate = new Date(c.starttime)

                return (
                  <div className='conferenceCard' id={getConfStatus(c)} key={c.id}>
                    <div className='head'>
                      <h3 className='title'>{c.title}</h3>
                    </div>
                    <div className='body'>
                      <div className='roomNumberContainer'>
                        <h5>Conference Room: </h5>
                        <h5 className='roomNumber'>{c.room}</h5>
                      </div>
                      <div className='chronals'>
                        <h6 className='time'>{startDate.toLocaleTimeString('en-US', { timeStyle: 'short' })}
                          - {new Date(c.endtime).toLocaleTimeString('en-US', { timeStyle: 'short' })}</h6>
                        <h6 className='date'>{startDate.toDateString().slice(0, -(String(startDate.getFullYear()).length + 1))}</h6>
                      </div>
                      <div className='divider'/>
                      <h6>Attendees:</h6>
                      <div className='attendees'>
                        <h5>{c.attendees.reduce((a, at) => `${a}${a ? ', ' : ''}${at}`, '')}</h5>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
          : (
            <div className='emptyMessageContainer'>
              <strong className='emptyMessage'>No scheduled conferences</strong>
            </div>
          )}
      </>
    )
  }
}

export default Directory
