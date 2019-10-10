import React from 'react'
import {
  parse as parseQuery
} from 'query-string'

import './styles/Room.css'

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
      return (
        <>
          <div className='roomCard'>
            hi
          </div>
  
          {this.state.upcoming
            ? (
              <div className='nextConfContainer'>
                next
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
