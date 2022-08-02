import React from 'react'
import {
  Link
} from 'react-router-dom'

import background from '../assets/images/building.jpg'

import './styles/Home.css'

class Home extends React.Component {
  render () {
    return (
      <div className='app-container home' style={{ backgroundImage: `url(${background})` }}>
        <div id='pages'>
          <Link to='/manager'>
            <span class='material-symbols-outlined'>
              schedule
            </span>

            My Meetings
          </Link>

          <Link to='/meetings'>
            <span class='material-symbols-outlined'>
              calendar_month
            </span>

            All Meetings
          </Link>

          <Link to='/directory'>
            <span class='material-symbols-outlined'>
              full_stacked_bar_chart
            </span>

            Tenant Directory
          </Link>

          <Link to='/directory'>
            <span class='material-symbols-outlined'>
              account_circle
            </span>

            Account
          </Link>
        </div>
      </div>
    )
  }

  expand () {
    this.setState({
      expanded: true
    })
  }
}

export default Home
