import React from 'react'
import {
  Link
} from 'react-router-dom'

import './styles/Rooms.css'

const {
  REACT_APP_API_URL
} = process.env

class Rooms extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      roomCount: 0
    }
  }

  componentDidMount () {
    fetch(REACT_APP_API_URL + '/room/count', {
      headers: {
        Accept: 'text/plain'
      }
    })
      .then((data) => data.text())
      .then((count) => this.setState({
        roomCount: parseInt(count)
      }))
  }

  render () {
    const roomButtons = []

    for (let i = 1; i <= this.state.roomCount; i++) {
      roomButtons.push((
        <Link className='roomButton' to={{
          pathname: '/room',
          search: '?room=' + i
        }} key={i}>
          <div className='roomNumberContainer'>
            <font className='roomNumber'>{i}</font>
          </div>
        </Link>
      ))
    }

    return (
      <div className='roomContainer'>
        {roomButtons}
      </div>
    )
  }
}

export default Rooms
