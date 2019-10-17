import React from 'react'
import {
  Redirect,
  Link
} from 'react-router-dom'

import './styles/Account.css'

import logoutIcon from '../assets/logout.svg'

const {
  REACT_APP_API_URL
} = process.env

class Account extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      user: null,
      editing: {},
      final: {},
      saved: false,
      error: null
    }

    this.onChange = this.onChange.bind(this)
    this.onEditToggle = this.onEditToggle.bind(this)
    this.submitChanges = this.submitChanges.bind(this)
    this.InputField = this.InputField.bind(this)
  }

  componentDidMount () {
    if (localStorage.getItem('auth')) {
      fetch(REACT_APP_API_URL + '/user/current/defining', {
        headers: {
          Authorization: localStorage.getItem('auth'),
          Accept: 'application/json'
        }
      }).then((data) => {
        data.json().then((user) => this.setState({
          user: {
            ...user,
            pass: ''
          }
        }))
      })
    }
  }

  onChange (event) {
    this.setState({
      user: {
        ...this.state.user,
        [event.target.id]: event.target.value
      }
    })
  }

  onEditToggle (event) {
    if (this.state.editing[event.target.id]) {
      this.setState({
        final: {
          ...this.state.final,
          [event.target.id]: this.state.user[event.target.id]
        }
      })
    }

    this.setState({
      editing: {
        ...this.state.editing,
        [event.target.id]: !this.state.editing[event.target.id]
      }
    })
  }

  submitChanges () {
    fetch(REACT_APP_API_URL + '/user/current/update', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('auth'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...this.state.final,
        pass: this.state.final.pass && this.state.final.pass.length ? this.state.pass : undefined
      })
    }).then((data) => {
      if (data.ok) {
        this.setState({
          saved: true
        })

        setTimeout(() => window.location.reload(), 1000)
      } else {
        data.text().then((err) => {
          if (err.startsWith('invalid param')) {
            const param = err.substring(err.indexOf(':') + 2)

            this.setState({
              error: 'Parameter cannot be empty: ' + param.substring(0, 1).toUpperCase() + param.substring(1)
            })
          } else {
            this.setState({
              error: err
            })
          }
        })
      }
    })
  }

  render () {
    if (!localStorage.getItem('auth')) {
      return (
        <Redirect to='/login'/>
      )
    }

    if (this.state.user) {
      return (
        <div className='accountPage'>
          <div className='accountContainer'>
            <div className='header'>
              <h1>Manage Account</h1>
            </div>

            <div className='inputsContainer'>
              <div className='nameContainer'>
                <h3 className='inputHeader'>Name</h3>
                <this.InputField id='name'/>
              </div>

              <div className='emailContainer'>
                <h3 className='inputHeader'>Email</h3>
                <this.InputField id='email'/>
              </div>

              <div className='passContainer'>
                <h3 className='inputHeader'>Password</h3>
                <this.InputField placeholder='SET A NEW PASSWORD' id='pass'/>
              </div>
            </div>

            <div id='divider'></div>

            <div className='submitButtonContainer'>
              <input type='submit' value='Save Changes' onClick={this.submitChanges}/>
              {this.state.saved ? (
                <h6 className='savedNotif'>Changes saved!</h6>
              ) : null}

              {this.state.error ? (
                <div className='errorContainer'>
                  <h6 className='error'>{this.state.error}</h6>
                </div>
              ) : null}

              <Link className='logoutContainer' to='/logout'>
                <img alt='logoutIcon' src={logoutIcon}/>

                <div className='logoutTextContainer'>
                  <font>Logout</font>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className='loadingContainer'>
        <font className='loadingText'>Loading...</font>
      </div>
    )
  }

  InputField (props) {
    return (
      <div className='inputArea'>
        <input
          value={this.state.user[props.id]}
          placeholder={props.placeholder}
          disabled={!this.state.editing[props.id]}
          onChange={this.onChange} id={props.id}
          type={props.id === 'pass' ? 'password' : 'text'}
        />
        <button type='button' onClick={this.onEditToggle} id={props.id}>{this.state.editing[props.id] ? '\u2714' : '\u270E'}</button>
      </div>
    )
  }
}

export default Account
