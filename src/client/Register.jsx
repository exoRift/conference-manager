import React from 'react'
import {
  Redirect
} from 'react-router-dom'
import {
  parse as parseQuery
} from 'query-string'

import './styles/Register.css'

import {
  formatError
} from './util/'

const {
  REACT_APP_API_URL
} = process.env

class Register extends React.Component {
  constructor (props) {
    super(props)

    this.query = parseQuery(window.location.search)
    this.params = props.match.params

    this.state = {
      data: {
        name: this.query.name || '',
        email: this.query.email || '',
        pass: ''
      },
      authState: 'waiting',
      error: null
    }

    this.handleChange = this.handleChange.bind(this)
    this.sendRegister = this.sendRegister.bind(this)
  }

  handleChange (event) {
    this.setState({
      data: {
        ...this.state.data,
        [event.target.name]: event.target.value
      }
    })
  }

  sendRegister (event) {
    event.preventDefault()

    fetch(`${REACT_APP_API_URL}/user/register/${this.params.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain'
      },
      body: JSON.stringify(this.state.data)
    }).then((data) => {
      data.text().then((res) => {
        if (data.ok) {
          this.setState({
            error: null,
            authState: 'success'
          })

          setTimeout(() => {
            localStorage.setItem('auth', res)

            window.location.reload()
          }, 1200)
        } else {
          this.setState({
            error: formatError(res),
            authState: 'failure'
          })

          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.setState({
              authState: 'waiting',
              error: null
            })
          }, 2000)
        }
      })
    })
  }

  render () {
    if (!this.params.id || localStorage.getItem('auth')) {
      return (
        <Redirect to='/'/>
      )
    } else {
      return (
        <div className='loginPage'>
          <div className='loginBox' id={this.state.authState}>
            <div className='headerSpace'>
              <h1 className='loginHeader'>Register an account to schedule meetings</h1>
              <h4 className='loginSubheader'>Some details may be autofilled from existing information</h4>
            </div>

            <div className='inputSpace'>
              <form onSubmit={this.state.authState === 'success' ? null : this.sendRegister}>
                <div className='nameSpace'>
                  <label>
                    <h2>Name:</h2>
                    <input name='name' type='text' onChange={this.handleChange} value={this.state.data.name}/>
                  </label>
                </div>

                <div className='emailSpace'>
                  <label>
                    <h2>Email:</h2>
                    <input name='email' type='text' onChange={this.handleChange} value={this.state.data.email}/>
                  </label>
                </div>

                <div className='passwordSpace'>
                  <label>
                    <h2>Password:</h2>
                    <input name='pass' type='password' onChange={this.handleChange} value={this.state.data.pass}/>
                  </label>
                </div>

                <input type='submit' value='Register'/>
              </form>

              {this.state.error ? (
                <div className='errorContainer'>
                  <h1 className='header'>Registration Error</h1>
                  <h4 className='error'>{this.state.error}</h4>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )
    }
  }
}

Register.propTypes = {
  match: () => {}
}

export default Register
