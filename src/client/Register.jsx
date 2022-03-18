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
      pass: ''
    }

    this.state = {
      data: this.initial,
      redirect: null,
      success: false,
      invalid: {},
      error: null
    }

    this.submit = this.submit.bind(this)
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)
  }

  render () {
    console.log(this.state)
    if (this.state.redirect) return <Redirect to={this.state.redirect}/>
    else if ('auth' in localStorage) return <Redirect to='/'/>
    else {
      return (
        <div className='app-container register interior-bg' style={{ backgroundImage: `url(${entrance})` }}>
          <UserBox
            data={this.initial}
            header='Register Your Account'
            display={['name', 'email', 'suite', 'tenant', 'pass']}
            locked={['suite']}
            blank={true}
            invalid={this.state.invalid}
            success={this.state.success}
            onChange={this.onChange.bind(this)}
            onError={this.props.onError}>
              <button className='btn btn-success' onClick={this.submit}>Finish</button>
          </UserBox>
        </div>
      )
    }
  }

  onChange (data) {
    this.setState({
      data: {
        ...this.initial,
        ...data
      }
    })
  }

  submit (event) {
    event.preventDefault() // Don't refresh page

    const filled = Object.values(this.state.data).reduce((a, v) => a && v && v.length, true)

    if (!this.state.success && document.getElementById('emailUBInput').checkValidity() && filled) {
      fetch(`/api/user/${this.params.id}/register`, {
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

            this.props.refreshNav()
          }, 1000)
        })
        .catch((res) => {
          if (res instanceof TypeError) this.props.onError(res) // Network errors
          else {
            res.json()
              .then(({ error }) => {
                if (res.status === 404) {
                  this.setState({
                    invalid: {
                      email: 'This email is not linked to an account'
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
      const invalid = {}

      for (const entry of Object.entries(this.state.data)) {
        invalid[entry[0]] = entry[1].length ? null : 'Required field'
      }
      this.setState({
        invalid
      })
    }
  }
}

export default Register
