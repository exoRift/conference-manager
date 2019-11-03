import React from 'react'
import {
  parse as parseQuery
} from 'query-string'

import './styles/Room.css'

import ConferenceCard from './util/ConferenceCard.jsx'

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
    fetch(REACT_APP_API_URL + '/room/' + room).then((data) => {
      if (data.ok) {
        data.json().then(async (confs) => {
          for (const conf in confs) {
            confs[conf].creator = await fetch(`${REACT_APP_API_URL}/user/${confs[conf].creator}/name`, {
              headers: {
                Authorization: localStorage.getItem('auth'),
                Accept: 'text/plain'
              }
            }).then((data) => data.text())
          }

          this.setState({
            selected: true,
            ...confs
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
      return (
        <>
          <div className='roomCardContainer'>
            <ConferenceCard conference={this.state.next} showDesc={true}/>
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
    }

    return (
      <div className='emptyMessageContainer'>
        <strong className='emptyMessage'>No scheduled conferences</strong>
      </div>
    )
  }
}

export default Room
