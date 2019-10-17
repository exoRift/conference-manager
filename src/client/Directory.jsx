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
    fetch(REACT_APP_API_URL + '/directory', {
      headers: {
        Accept: 'application/json'
      }
    }).then((data) => {
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
              {this.state.confs.map((c, i) => (
                <ConferenceCard conference={c} key={i}/>
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
