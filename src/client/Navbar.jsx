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
      name: ''
    }
  }

  componentDidMount () {
    fetch(`${REACT_APP_API_URL}/user/${localStorage.getItem('id')}/name`, {
      headers: {
        'Accept': 'text/plain'
      }
    }).then((data) => {
      data.text().then((name) => {
        this.setState({
          name
        })
      })
    })
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

              <div className='divider'></div>
            </div>
          ))}
        </div>

        <Link className='userContainer' to='/account'>
          <div className='iconContainer'>
            <img alt='accountIcon' src={accountIcon}/>
          </div>
          <div className='nameContainer'>
            <strong>{this.state.name}</strong>
          </div>
        </Link>
      </div>
    )
  }
}

export default Navbar
