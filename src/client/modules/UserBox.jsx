import React from 'react'

import postFetch from '../util/postFetch.js'

import '../styles/UserBox.css'

const gloss = {
  name: {
    label: 'Name'
  },
  email: {
    label: 'Email Address',
    type: 'email'
  },
  suite: {
    label: 'Suite ID'
  },
  tenant: {
    label: 'Tenant Name'
  },
  pass: {
    label: 'Change Password',
    blankLabel: 'Password',
    type: 'password'
  },
  admin: {
    label: 'Admin',
    type: 'checkbox'
  }
}

const maxLengths = {
  name: 20,
  suite: 4,
  tenant: 20,
  email: 40,
  pass: 100
}

class UserBox extends React.Component {
  static defaultProps = {
    blank: false,
    invalid: {}
  }

  constructor (props) {
    super(props)

    this.state = {
      user: props.data || {},
      alter: {},
      invalid: {},
      editing: props.blank,
      success: false,
      lockSave: false
    }

    if (this.props.blank) {
      const template = {}

      for (const field of props.display) {
        switch (field) {
          case 'name':
            template.firstname = ''
            template.lastname = ''

            break
          case 'admin':
            template.admin = false

            break
          default:
            template[field] = ''
            break
        }
      }

      this.state.user = {
        ...template,
        ...this.state.user
      }
    }
  }

  componentDidMount () {
    if ('auth' in localStorage && !this.props.blank) {
      fetch(`/api/user/${this.props.user}/all`, {
        method: 'GET',
        headers: {
          Authorization: localStorage.auth
        }
      })
        .then(postFetch)
        .then((user) => user.json())
        .then((user) => {
          this.setState({ user })

          this.props.onInfo?.(user)
        })
        .catch(this.props.onError)
    }
  }

  render () {
    return (
      <form className='userbox' onSubmit={this.submit.bind(this)}>
        {this.props.header
          ? <span className='header'>{this.props.header}</span>
          : null}
        {this.props.display.map((p, i) => {
          const invalid = p === 'name'
            ? this.state.invalid.firstname || this.state.invalid.lastname || this.props.invalid.firstname || this.props.invalid.lastname
            : this.state.invalid[p] || this.props.invalid[p]

          return (
            <div className='form-group' key={i}>
              <label htmlFor={p + 'UBInput'}>{(this.props.blank ? gloss[p].blankLabel : null) || gloss[p].label}</label>
              {p === 'name'
                ? <>
                  <input
                    className={`form-control${this.state.success || this.props.success
                      ? ' is-valid'
                      : ''}${this.state.invalid.firstname
                        ? ' is-invalid'
                        : ''}`}
                    id={'firstNameUBInput'}
                    placeholder={this.state.user.firstname || 'First'}
                    disabled={!this.state.editing || this.props.locked?.includes(p)}
                    value={this.state.alter.firstname || ''}
                    maxLength={maxLengths.name}
                    onChange={this.onChange.bind(this, 'firstname')}/>

                  <input
                    className={`form-control${this.state.success || this.props.success
                      ? ' is-valid'
                      : ''}${this.state.invalid.lastname
                        ? ' is-invalid'
                        : ''}`}
                    id={'lastNameUBInput'}
                    placeholder={this.state.user.lastname || 'Last'}
                    disabled={!this.state.editing || this.props.locked?.includes(p)}
                    value={this.state.alter.lastname || ''}
                    maxLength={maxLengths.name}
                    onChange={this.onChange.bind(this, 'lastname')}/>
                </>
                : gloss[p].type === 'checkbox'
                  ? <input
                    type={gloss[p].type}
                    className={`form-control${this.state.success || this.props.success
                      ? ' is-valid'
                      : ''}${this.state.invalid[p]
                        ? ' is-invalid'
                        : ''}`}
                    id={p + 'UBInput'}
                    disabled={!this.state.editing || this.props.locked?.includes(p)}
                    checked={this.state.alter[p] === undefined ? this.state.user[p] || '' : this.state.alter[p]}
                    maxLength={maxLengths[p]}
                    onChange={this.onChange.bind(this, p)}/>
                  : <input
                    type={gloss[p].type}
                    className={`form-control${this.state.success || this.props.success
                      ? ' is-valid'
                      : ''}${this.state.invalid[p]
                        ? ' is-invalid'
                        : ''}`}
                    id={p + 'UBInput'}
                    aria-describedby={p === 'email' ? 'emailUBHelp' : null}
                    placeholder={this.state.user[p] || (p === 'tenant' ? 'NONE' : null)}
                    disabled={!this.state.editing || this.props.locked?.includes(p)}
                    value={this.state.alter[p] || ''}
                    maxLength={maxLengths[p]}
                    onChange={this.onChange.bind(this, p)}/>}
              {invalid
                ? <div className='invalid-feedback'>{invalid}</div>
                : null
              }
              {p === 'email'
                ? <small id='emailUBHelp' className='form-text text-muted sub-message'>This email is visibile to only those with an account.</small>
                : null
              }
            </div>
          )
        })}

        {this.props.blank
          ? null
          : this.state.editing
            ? (
              <div className='editing-button-container'>
                <button type='submit' className='btn btn-primary btn-success' disabled={this.state.lockSave || this.props.lockSave}>Save Changes</button>
                <button type='button' className='btn btn-danger btn-cancel' onClick={() => this.setState({ editing: false, alter: {} })}>Cancel</button>
              </div>
              )
            : <button type='button' className='btn btn-primary' onClick={() => this.setState({ editing: true })}>Edit</button>}

          {this.props.children}
      </form>
    )
  }

  onChange (field, event) {
    const altered = {
      ...this.state.alter,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    }

    if (event.target.type !== 'checkbox' && !event.target.value.length) delete altered[field]

    this.props.onChange?.(altered)

    this.setState({
      alter: altered
    })
  }

  submit (event) {
    event.preventDefault()

    if (Object.keys(this.state.alter).length) {
      this.setState({
        lockSave: true
      })

      fetch('/api/user/' + this.props.user, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.auth
        },
        body: JSON.stringify({
          ...this.state.alter,
          tenant: this.state.alter.tenant === 'NONE' ? '' : this.state.alter.tenant
        })
      })
        .then(postFetch)
        .then((token) => token.text())
        .then((token) => {
          this.setState({
            editing: false,
            success: true
          })

          return this.props.onSuccess?.(token)
        })
        .catch((res) => res.json()
          .then(({ error }) => {
            if (res.status === 409) {
              return this.setState({
                invalid: {
                  email: error.message[0].toUpperCase() + error.message.slice(1)
                }
              })
            } else if (error.message === 'invalid email') {
              return this.setState({
                invalid: {
                  email: 'Invalid email'
                }
              })
            } else if (error.message.includes('too long')) {
              const [
                ,
                arg,
                limit
              ] = error.message.match(/.*{(.+)}.*{(.+)}.*/)

              return this.setState({
                invalid: {
                  [arg]: `Too long. Limit: ${limit} characters${arg.endsWith('name') ? ' each' : ''}`
                }
              })
            } else return this.props.onError(error)
          }))
        .finally(() => this.setState({ lockSave: false }))
    } else {
      this.setState({
        editing: false
      })
    }
  }
}

export default UserBox
