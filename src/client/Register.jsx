import React from 'react'
import {
  Redirect
} from 'react-router-dom'
import {
  parse as parseQuery
} from 'query-string'

import postFetch from './util/postFetch.js'
import UserBox from './modules/UserBox.jsx'
import entrance from '../assets/images/entrance.jpg'

import './styles/Register.css'

class Register extends React.Component {
  constructor (props) {
    super(props)

    this.query = parseQuery(window.location.search)
    this.params = props.match.params

    this.initial = {
      firstname: this.query.firstname || '',
      lastname: this.query.lastname || '',
      email: this.query.email || '',
      tenant: this.query.tenant || '',
      pass: ''
    }

    this.state = {
      data: this.initial,
      redirect: null,
      success: false,
      invalid: {},
      locked: false
    }

    this.type = window.location.pathname.split('/')[1]

    this.onChange = this.onChange.bind(this)
    this.submit = this.submit.bind(this)
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect}/>
    else if ('auth' in localStorage) return <Redirect to='/'/>

    return (
      <div className='app-container register interior-bg' style={{ backgroundImage: `url(${entrance})` }}>
        <div className='login-box'>
          <UserBox
            data={this.initial}
            header={this.type === 'register' ? 'Register Your Account' : 'Reset Your Password'}
            hide={this.type === 'register' ? ['admin'] : ['admin', 'tenant']}
            locked={this.type === 'register' ? ['tenant'] : ['name', 'email']}
            blank={true}
            invalid={this.state.invalid}
            success={this.state.success}
            onChange={this.onChange}
            onError={this.props.onError}
            onSubmit={this.submit}
          >
            <button type='submit' className='btn btn-success' disabled={this.state.locked}>Finish</button>
          </UserBox>
        </div>
      </div>
    )
  }

  onChange (data) {
    this.setState({
      data: {
        ...this.initial,
        ...data
      }
    })
  }

  submit (e, validate) {
    e.preventDefault()

    const filled = Object.entries(this.state.data).every(([k, v]) => (v && v.length) || k === 'tenant')

    this.setState({
      locked: true
    })

    if (!this.state.success && filled) {
      switch (this.type) {
        case 'register':
          return fetch(`/api/user/${this.params.id}/register`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state.data)
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
                  redirect: '/'
                })
              }, 1000)
            })
            .catch(validate)
            .finally(() => this.setState({ locked: false }))
        case 'reset':
          return fetch(`/api/user/${this.params.id}/reset`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              pass: this.state.data.pass,
              token: this.query.token
            })
          })
            .then(postFetch)
            .then(() => {
              this.setState({
                success: true,
                invalid: {}
              })

              clearTimeout(this.timeout)
              this.timeout = setTimeout(() => {
                this.setState({
                  redirect: '/login'
                })
              }, 1000)
            })
            .catch(validate)
            .finally(() => this.setState({ locked: false }))
        default: break
      }
    } else {
      const invalid = {}
      for (const [key, value] of Object.entries(this.state.data)) {
        invalid[key] = value.length || key === 'tenant' ? null : 'Required field'
      }

      this.setState({
        invalid,
        locked: false
      })
    }
  }
}

export default Register
