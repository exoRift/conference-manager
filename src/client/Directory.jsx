import React from 'react'

import Clock from './util/Clock.jsx'

import './styles/Directory.css'

import Banner from '../assets/banner.png'

import ConferenceCard from './util/ConferenceCard.jsx'

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
    fetch(REACT_APP_API_URL + '/conference/all', {
      headers: {
        Accept: 'application/json'
      }
    })
      .then((data) => data.json())
      .then((confs) => Promise.all(confs.map(async (c) => {
        c.creator = await fetch(`${REACT_APP_API_URL}/user/${c.creator}/name`, {
          headers: {
            Authorization: localStorage.getItem('auth'),
            Accept: 'text/plain'
          }
        }).then((data) => data.text())

        c.attendees = await Promise.all(c.attendees.map((a) => fetch(`${REACT_APP_API_URL}/user/${a}/name`, {
          headers: {
            Authorization: localStorage.getItem('auth'),
            Accept: 'text/plain'
          }
        }).then((data) => data.text())))

        return c
      })))
      .then((confs) => this.setState({
        confs
      }))
  }

  render () {
    if (this.state.confs.length) console.log(this.state.confs[0].creator)
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
            <div className='conferenceCardList'>
              {this.state.confs.map((c, i) => (
                <div className='conferenceCardContainer' key={i}>
                  <ConferenceCard conference={c}/>
                </div>
              ))}
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
