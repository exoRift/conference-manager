import React from 'react'
import {
  Redirect
} from 'react-router-dom'

import './styles/Login.css'

const {
  REACT_APP_API_URL
} = process.env

class Login extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      pass: '',
      authState: 'waiting',
      error: null
    }

    this.handleChange = this.handleChange.bind(this)
    this.sendLogin = this.sendLogin.bind(this)
  }

  handleChange (event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  formatStatusMessage (msg) {
    switch (msg) {
      case 'invalid user': return 'Could not find a user with the name: ' + this.state.name
      case 'invalid pass': return 'Invalid password provided'
      default: return msg
    }
  }

  sendLogin (event) {
    event.preventDefault()

    if (this.state.authState === 'success') return

    fetch(REACT_APP_API_URL + '/login', {
      method: 'POST',
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: this.state.name,
        pass: this.state.pass
      })
    }).then((data) => {
      if (data.ok) {
        data.text().then((token) => {
          this.setState({
            authState: 'success'
          })

          setTimeout(() => {
            localStorage.setItem('auth', token)

            window.location.reload()
          }, 1200)
        })
      } else {
        data.text().then((msg) => {
          const error = (
            <div className='errorContainer'>
              <h1 className='header'>Login Error</h1>
              <h4 className='error'>{this.formatStatusMessage(msg)}</h4>
            </div>
          )

          this.setState({
            authState: 'failure',
            error
          })

          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.setState({
              authState: 'waiting',
              error: null
            })
          }, 2000)
        })
      }
    })
  }

  render () {
    if (localStorage.getItem('auth')) {
      return (
        <Redirect to='/'/>
      )
    }

    return (
      <div className='loginPage'>
        <div className='loginBox' id={this.state.authState}>
          <div className='headerSpace'>
            <h1 className='loginHeader'>Log into your account to schedule meetings</h1>
            <h4 className='loginSubheader'>Don&apos;t have an account? Ask the building manager to open one for you</h4>
          </div>

          <div className='inputSpace'>
            <form onSubmit={this.sendLogin}>
              <div className='nameSpace'>
                <label>
                  <h2>Name:</h2>
                  <input name='name' type='text' onChange={this.handleChange}/>
                </label>
              </div>

              <div className='passwordSpace'>
                <label>
                  <h2>Password:</h2>
                  <input name='pass' type='password' onChange={this.handleChange}/>
                </label>
              </div>
              <input type='submit' value='Login'/>
            </form>

            {this.state.error}
          </div>
        </div>
      </div>
    )
  }
}

export default Login
