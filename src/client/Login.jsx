import React from 'react'
import {
  Redirect
} from 'react-router-dom'
import {
  formatError
} from './util/'

const {
  REACT_APP_API_URL
} = process.env

class Login extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      data: {
        iden: '',
        pass: ''
      },
      authState: 'waiting',
      error: null
    }

    this.handleChange = this.handleChange.bind(this)
    this.sendLogin = this.sendLogin.bind(this)
  }

  handleChange (event) {
    this.setState({
      data: {
        ...this.state.data,
        [event.target.name]: event.target.value
      }
    })
  }

  sendLogin (event) {
    event.preventDefault()

    if (this.state.authState === 'success') return

    fetch(REACT_APP_API_URL + '/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain'
      },
      body: JSON.stringify(this.state.data)
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
        data.text().then((err) => {
          const error = (
            <div className='errorContainer'>
              <h1 className='header'>Login Error</h1>
              <h4 className='error'>{formatError(err)}</h4>
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
              <div className='idenSpace'>
                <label>
                  <h2>Name or email:</h2>
                  <input name='iden' type='text' onChange={this.handleChange}/>
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
