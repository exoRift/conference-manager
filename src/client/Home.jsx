import React from 'react'
import {
  Link
} from 'react-router-dom'

import postFetch from './util/postFetch.js'
import background from '../assets/images/building.jpg'

import './styles/Home.css'

class Home extends React.Component {
  state = {
    user: {}
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
        .then((user) => this.setState({
          user: {
            ...this.state.user,
            ...user
          }
        }))
        .catch(this.props.onError)

      fetch('/api/user/self/admin', {
        method: 'GET',
        headers: {
          Authorization: localStorage.auth
        }
      })
        .then(postFetch)
        .then((user) => user.json())
        .then((user) => this.setState({
          user: {
            ...this.state.user,
            ...user
          }
        }))
        .catch(this.props.onError)
    }
  }

  render () {
    return (
      <div className='app-container home' style={{ backgroundImage: `url(${background})` }}>
        <div className='content'>
          {'auth' in localStorage ? <h2>Welcome back, {this.state.user.firstname}</h2> : null}

          <div id='pages'>
            <Link to='/manager' disabled={!('auth' in localStorage)}>
              <span className='material-symbols-outlined'>
                schedule
              </span>

              My Meetings
            </Link>

            <Link to='/meetings' disabled={!('auth' in localStorage)}>
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

            {'auth' in localStorage
              ? (
                <Link to='/account'>
                  <span className='material-symbols-outlined'>
                    account_circle
                  </span>

                  Account

                  <div className='logout-btn' onClick={this.logout}>
                    <span className='material-symbols-outlined'>
                      logout
                    </span>

                    Log out
                  </div>
                </Link>
                )
              : (
                <Link to='/login'>
                  <span className='material-symbols-outlined'>
                    login
                  </span>

                  Login
                </Link>
                )}

              {this.state.user.admin
                ? (
                  <Link to='/admin'>
                    <span className='material-symbols-outlined'>
                      security
                    </span>

                    Admin Panel
                  </Link>
                  )
                : null}
          </div>

          {!('auth' in localStorage) ? <h4>Tenants without accounts should contact a building administrator to have an account created</h4> : null}
        </div>
      </div>
    )
  }

  logout (e) {
    e.preventDefault()
    e.stopPropagation()

    localStorage.removeItem('auth')

    document.location.reload()
  }
}

export default Home
