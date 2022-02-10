import React from 'react'
import {
  Link
} from 'react-router-dom'

import postFetch from '../util/postFetch.js'
import user from '../../assets/svg/user.svg'

import '../styles/UserButton.css'

class UserButton extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      user: null
    }
  }

  componentDidMount () {
    if ('auth' in localStorage) {
      fetch('/api/user/current/firstname', {
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
      <Link to='/account' id='userContainer'>
        {this.state.user
          ? <span className='name'>{this.state.user.firstname}</span>
          : <span className='name'>Log In</span>}

        <img src={user} alt='user icon'/>
      </Link>
    )
  }
}

export default UserButton
