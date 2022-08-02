import React from 'react'
import {
  Link
} from 'react-router-dom'

import postFetch from './util/postFetch.js'
import background from '../assets/images/building.jpg'

import './styles/Home.css'

class Home extends React.Component {
  state = {
    user: null
  }

  componentDidMount () {
    if ('auth' in localStorage) {
      fetch('/api/user/self/firstname', {
        method: 'GET',
        headers: {
          Authorization: localStorage.auth
        }
      })
        .then(postFetch)
        .then((user) => user.json())
        .then((user) => this.setState({ user }))
        .catch(this.props.onError)
    }
  }

  render () {
    return (
      <div className='app-container home' style={{ backgroundImage: `url(${background})` }}>
        <div className='content'>
          {this.state.user ? <h2>Welcome back, {this.state.user.firstname}</h2> : null}

          <div id='pages'>
            <Link to='/manager'>
              <span className='material-symbols-outlined'>
                schedule
              </span>

              My Meetings
            </Link>

            <Link to='/meetings'>
              <span className='material-symbols-outlined'>
                calendar_month
              </span>

              All Meetings
            </Link>

            <Link to='/tenants'>
              <span className='material-symbols-outlined'>
                full_stacked_bar_chart
              </span>

              Tenant Directory
            </Link>

            <Link to='/account'>
              <span className='material-symbols-outlined'>
                account_circle
              </span>

              Account
            </Link>
          </div>
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
