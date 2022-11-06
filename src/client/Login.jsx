import React from 'react'
import {
  Redirect
} from 'react-router-dom'
import {
  parse as parseQuery
} from 'query-string'

import postFetch from './util/postFetch.js'
import entrance from '../assets/images/entrance.jpg'

import './styles/Login.css'

class Login extends React.Component {
  state = {
    email: '',
    pass: '',
    invalid: {
      email: null,
      pass: null
    },
    success: null,
    redirect: null,
    forgetting: false,
    forgotten: false
  }

  constructor (props) {
    super(props)

    this.query = parseQuery(window.location.search)

    this.submit = this.submit.bind(this)
    this.forgetPassword = this.forgetPassword.bind(this)
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect}/>
    else if ('auth' in localStorage) return <Redirect to='/'/>

    return (
      <div className='app-container login interior-bg' style={{ backgroundImage: `url(${entrance})` }}>
        <form className='login-box' onSubmit={this.submit}>
          {this.query.error === 'logged_out'
            ? (
              <span className='header issue'>You have been logged out. Please log back in</span>
              )
            : <span className='header'>Login to your account</span>}

          <div className='form-group'>
            <label htmlFor='emailInput'>Email address</label>
            <input
              type='email'
              className={`form-control${this.state.success ? ' is-valid' : ''}${this.state.invalid.email ? ' is-invalid' : ''}`}
              id='emailInput'
              aria-describedby='emailHelp'
              placeholder='Enter email'
              value={this.state.email}
              onChange={this.onChange.bind(this, 'email')}/>
            {this.state.invalid.email
              ? <div className='invalid-feedback'>{this.state.invalid.email}</div>
              : null}
            <small id='emailHelp' className='form-text text-muted sub-message'>This email is visibile to only those with an account.</small>
          </div>

          <div className='form-group'>
            <label htmlFor='passwordInput'>Password</label>
            <input
              type='password'
              className={`form-control${this.state.success ? ' is-valid' : ''}${this.state.invalid.pass ? ' is-invalid' : ''}`}
              id='passwordInput'
              placeholder='Enter password'
              value={this.state.pass}
              onChange={this.onChange.bind(this, 'pass')}/>
            {this.state.invalid.pass
              ? <div className='invalid-feedback'>{this.state.invalid.pass}</div>
              : null}
          </div>

          <button type='submit' className='btn btn-primary' disabled={this.state.success}>Log In</button>

          <div
            className={`forgot${this.state.forgotten ? ' sent' : ''}`}
            onClick={this.state.forgetting ? null : this.forgetPassword}
            disabled={this.state.forgetting}
          >
            {this.state.forgotten
              ? 'Email Sent!'
              : 'Forgot Password'}
          </div>
        </form>
      </div>
    )
  }

  onChange (field, event) {
    this.setState({
      [field]: event.target.value
    })
  }

  submit (event) {
    event.preventDefault() // Don't refresh page

    if (!this.state.success && this.state.email.length && this.state.pass.length) {
      fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state)
      })
        .then(postFetch)
        .then((token) => token.text())
        .then((token) => {
          this.setState({
            success: true,
            invalid: {}
          })

          localStorage.setItem('auth', token)

          clearTimeout(this.timeout)
          this.timeout = setTimeout(() => {
            this.setState({
              redirect: this.query.redirect || '/'
            })
          }, 1000)
        })
        .catch((res) => {
          if (res instanceof TypeError) return this.props.onError(res) // Network errors
          else {
            return res.json()
              .then(({ error }) => {
                if (res.status === 404) {
                  this.setState({
                    invalid: {
                      email: 'There is no account with this email'
                    }
                  })
                } else if (error.message === 'incorrect password') {
                  this.setState({
                    invalid: {
                      pass: 'Password incorrect'
                    }
                  })
                } else this.props.onError(error)
              })
          }
        })
    } else {
      this.setState({
        invalid: {
          email: this.state.email.length ? null : 'Required field',
          pass: this.state.pass.length ? null : 'Required field'
        }
      })
    }
  }

  forgetPassword () {
    if (this.state.email.length) {
      this.setState({
        forgetting: true
      })

      return fetch('/api/user/requestreset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.state.email
        })
      })
        .then(postFetch)
        .then(() => this.setState({
          forgotten: true
        }))
        .catch((res) => {
          if (res.status === 404) {
            this.setState({
              forgetting: false,
              forgotten: false,
              invalid: {
                email: 'Could not find a user with this email'
              }
            })
          } else return this.props.onError(res)
        })
    } else {
      this.setState({
        invalid: {
          email: 'Email required to reset password'
        }
      })
    }
  }
}

export default Login
