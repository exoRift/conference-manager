import React from 'react'
import {
  Link
} from 'react-router-dom'

import routes from './util/routes.js'

import './styles/Navbar.css'

import accountIcon from '../assets/account_icon.svg'

const {
  REACT_APP_API_URL
} = process.env

class Navbar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: null,
      admin: false
    }
  }

  componentDidMount () {
    if (localStorage.getItem('auth')) {
      fetch(REACT_APP_API_URL + '/user/current/name', {
        headers: {
          Accept: 'text/plain',
          Authorization: localStorage.getItem('auth')
        }
      }).then((data) => {
        if (data.ok) {
          data.text().then((name) => this.setState({
            name
          }))
        } else if (data.body === 'invalid token') localStorage.removeItem('auth')
      })

      fetch(REACT_APP_API_URL + '/user/current/admin', {
        headers: {
          Accept: 'text/plain',
          Authorization: localStorage.getItem('auth')
        }
      }).then((data) => {
        if (data.ok) {
          data.text().then((admin) => {
            if (JSON.parse(admin)) {
              routes.push({
                name: 'Admin Panel',
                path: '/admin'
              })

              this.setState({
                admin: true
              })
            }
          })
        }
      })
    }
  }

  render () {
    return (
      <div id='navbar'>
        <div className='routes'>
          {routes.map((route, index) => route.hidden ? undefined : (
            <div className='routeContainer' key={index}>
              <Link to={route.path}>
                <h4>{route.name}</h4>
              </Link>

              <div id='divider'></div>
            </div>
          ))}
        </div>

        <Link className='userContainer' to={this.state.name ? '/account' : '/login'} id={this.state.name ? 'logged' : 'unlogged'}>
          <div className='iconContainer'>
            <img alt='accountIcon' src={accountIcon}/>
          </div>
          <div className='nameContainer'>
            <strong>{this.state.name || 'Log in'}</strong>
          </div>
        </Link>
      </div>
    )
  }
}

export default Navbar
