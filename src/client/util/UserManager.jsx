import React from 'react'

import Popup from './Popup.jsx'

import trashIcon from '../../assets/trash.svg'

import {
  formatError
} from './'

const {
  REACT_APP_API_URL
} = process.env

class UserManager extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      current: null,
      users: [],
      final: [],
      editing: [],
      saved: false,
      error: null,
      readyDelete: null
    }

    this.onChange = this.onChange.bind(this)
    this.onToggle = this.onToggle.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.create = this.create.bind(this)
    this.readyDelete = this.readyDelete.bind(this)
    this.unreadyDelete = this.unreadyDelete.bind(this)
    this.onDelete = this.onDelete.bind(this)
  }

  componentDidMount () {
    fetch(REACT_APP_API_URL + '/user/current/id', {
      headers: {
        Authorization: localStorage.getItem('auth'),
        Accept: 'text/plain'
      }
    }).then((data) => {
      if (data.ok) {
        data.text().then((current) => this.setState({
          current
        }))
      }
    })

    return fetch(REACT_APP_API_URL + '/user/all/defining', {
      headers: {
        Authorization: localStorage.getItem('auth'),
        Accept: 'application/json'
      }
    }).then((data) => {
      if (data.ok) {
        return data.json().then((users) => this.setState({
          users
        }))
      }
    })
  }

  onChange (id) {
    return (event) => {
      const index = this.state.users.findIndex((u) => u.id === id)

      const changes = this.state.users

      changes[index][event.target.id] = event.target.type === 'checkbox' ? event.target.checked : event.target.value

      this.setState({
        users: changes
      })
    }
  }

  onToggle (event) {
    if (this.state.editing.includes(event.target.id)) {
      const changes = this.state.final
      const user = this.state.users.find((u) => u.id === event.target.id)
      const index = changes.findIndex((u) => u.id === user.id)

      if (index === -1) changes.push(user)
      else changes[index] = user

      this.setState({
        final: changes
      })
    }

    const changes = this.state.editing

    const index = this.state.editing.findIndex((u) => u === event.target.id)

    if (index === -1) changes.push(event.target.id)
    else changes.splice(index, 1)

    this.setState({
      editing: changes
    })
  }

  readyDelete (user) {
    return () => {
      if (user.id === this.state.current) {
        this.setState({
          error: 'Cannot delete yourself'
        })

        setTimeout(() => this.setState({
          error: null
        }), 2000)
      } else {
        this.setState({
          readyDelete: {
            id: user.id,
            user: user.name
          }
        })
      }
    }
  }

  unreadyDelete () {
    this.setState({
      readyDelete: undefined
    })
  }

  onDelete (user) {
    return () => {
      fetch(REACT_APP_API_URL + `/user/${user}/delete`, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('auth')
        }
      }).then((data) => {
        if (data.ok) {
          const changes = [
            ...this.state.users
          ]

          changes.splice(changes.findIndex((c) => c.id === user), 1)

          this.setState({
            users: changes,
            readyDelete: undefined
          })
        }
      })
    }
  }

  async create (user) {
    return fetch(REACT_APP_API_URL + '/user/create', {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('auth'),
        'Content-Type': 'application/json',
        Accept: 'text/plain'
      },
      body: JSON.stringify(user)
    })
      .then((data) => {
        return data.text().then((content) => {
          if (data.ok) {
            return this.componentDidMount().then(() => {
              return {
                id: content,
                ...user
              }
            })
          } else {
            const err = Error(content)
            err.code = data.status

            throw err
          }
        })
      })
  }

  onSubmit () {
    const promises = []

    for (const user of this.state.final) {
      for (const param in user) {
        if (param !== 'pass' && typeof user[param] === 'string' && !user[param].length) {
          return this.setState({
            error: 'Parameter cannot be empty: ' + param.substring(0, 1).toUpperCase() + param.substring(1)
          })
        }
      }
    }

    for (const user of this.state.final) {
      promises.push(fetch(`${REACT_APP_API_URL}/user/${user.id}/update`, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('auth'),
          Accept: 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      }))
    }

    Promise.all(promises).then((responses) => {
      this.setState({
        error: null,
        saved: true
      })

      for (const data of responses) {
        if (!data.ok) {
          data.text().then((err) => this.setState({
            error: formatError(err),
            saved: false
          }))

          break
        }
      }

      setTimeout(() => this.setState({
        saved: false,
        error: null
      }), 2000)
    })
  }

  render () {
    return (
      <>
        {
          this.state.readyDelete ? (
            <Popup message={`Are you sure you want to delete ${this.state.readyDelete.user}?`} noChoice={this.unreadyDelete} yesChoice={this.onDelete(this.state.readyDelete.id)}/>
          ) : null
        }
        <div className='users'>
          <div className='headers'>
            <h3>Name</h3>
            <h3>Email</h3>
            <h3>Password</h3>
          </div>

          <div className='userContainer'>
            {this.state.users.map((u) => {
              const onChange = this.onChange(u.id)
              const disabled = !this.state.editing.includes(u.id) || !u.registered

              return (
                <div className={'objectContainer' + (u.registered ? '' : ' unregistered')} data-toggle={u.registered ? 'tooltip' : null} title='Unregistered user' key={u.id}>
                  <div className='data'>
                    <input value={u.name} onChange={onChange} id='name' disabled={disabled}/>
                    <input type='email' value={u.email} onChange={onChange} id='email' disabled={disabled}/>
                    <input placeholder='SET A NEW PASSWORD' value={u.pass || ''} onChange={onChange} id='pass' disabled={disabled}/>
                    <input type='checkbox' checked={JSON.parse(u.admin)} onChange={onChange} id='admin' disabled={disabled} data-toggle='tooltip' title='Give user admin status'/>
                    <div className='trashContainer' id={!this.state.editing.includes(u.id) ? 'disabled' : 'enabled'} onClick={!this.state.editing.includes(u.id) ? null : this.readyDelete(u)}>
                      <div className='imgContainer'>
                        <img src={trashIcon} alt='delete'/>
                      </div>
                    </div>

                    <button type='button' onClick={this.onToggle} id={u.id}>{this.state.editing.includes(u.id) ? '\u2714' : '\u270E'}</button>
                  </div>
                </div>
              )
            })}
          </div>

          {this.state.saved
            ? (
              <h4 className='adminSavedNotif'>Changes saved!</h4>
            )
            : null}
          {this.state.error
            ? (
              <div className='adminErrorContainer'>
                <h6 className='error'>{this.state.error}</h6>
              </div>
            )
            : null}
        </div>
      </>
    )
  }
}

export default UserManager
