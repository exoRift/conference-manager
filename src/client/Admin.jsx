import React from 'react'
import {
  Redirect
} from 'react-router-dom'

import postFetch from './util/postFetch.js'
import UserBox from './modules/UserBox.jsx'
import TenantBox from './modules/TenantBox.jsx'
import MeetingStrip from './modules/MeetingStrip.jsx'

import './styles/Admin.css'

const roomBounds = [1, 2]

class Admin extends React.Component {
  state = {
    page: 'users',
    users: [],
    tenants: [],
    meetings: [],
    index: null,
    deletingUser: null,
    deletingTenant: null,
    addingUser: null,
    addingTenant: null,
    deflect: false,
    refreshed: false,
    locked: false
  }

  constructor (props) {
    super(props)

    this.updateUsers = this.updateUsers.bind(this)
    this.updateTenants = this.updateTenants.bind(this)
    this.updateMeetings = this.updateMeetings.bind(this)
  }

  componentDidMount () {
    return fetch('/api/user/self/admin', {
      method: 'GET',
      headers: {
        Authorization: localStorage.auth
      }
    })
      .then(postFetch)
      .then((user) => user.json())
      .then(({ admin }) => {
        if (admin) this.refresh()
        else this.setState({ deflect: true })
      })
      .catch(this.props.onError)
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)
  }

  render () {
    const pages = {
      users: {
        name: 'Users',
        dom: (
          <div className='management-container user'>
            <div className='add-container'>
              <button className='btn btn-success' onClick={() => this.setState({ addingUser: {} })}>+ Add User</button>
            </div>

            <div className='user-list-container'>
              {this.state.users.map((u, i) => (
                <div className={`index user${this.state.index === i ? ' expanded' : ''}`} key={i}>
                  <div className='dropdown' onClick={this.toggleIndex.bind(this, i)}>
                    <div className={'arrow ' + (this.state.index === i ? 'down' : 'right')}/>
                  </div>

                  {this.state.index === i
                    ? <UserBox
                      id={u.id}
                      header={'Edit User: ' + u.id}
                      display={['name', 'email', 'suite', 'tenant', 'pass', 'admin']}
                      onError={this.props.onError}/>
                    : (
                      <>
                        <div className={`name${u.partial ? ' partial' : ''}`}>{u.firstname} {u.lastname}</div>

                        <span className='delete-button user' onClick={() => this.setState({ deletingUser: u })}>Delete</span>
                      </>
                      )}
                </div>
              ))}
            </div>
          </div>
        )
      },
      tenants: {
        name: 'Tenants',
        dom: (
          <div className='management-container tenant'>
            <div className='add-container'>
              <button className='btn btn-success' onClick={() => this.setState({ addingTenant: {} })}>+ Register Tenant</button>
            </div>

            <div className='tenant-list-container'>
              {this.state.tenants.map((t, i) => (
                <div className={`index tenant${this.state.index === i ? ' expanded' : ''}`} key={i}>
                  <div className='dropdown' onClick={this.toggleIndex.bind(this, i)}>
                    <div className={'arrow ' + (this.state.index === i ? 'down' : 'right')}/>
                  </div>

                  {this.state.index === i
                    ? <TenantBox
                      data={t}
                      header={'Edit Tenant: ' + t.id}
                      onError={this.props.onError}/>
                    : (
                      <>
                        <div className='name'>{t.name} - {t.suite}</div>

                        <span className='delete-button tenant' onClick={() => this.setState({ deletingTenant: t })}>Delete</span>
                      </>
                      )}
                </div>
              ))}
            </div>
          </div>
        )
      },
      meetings: {
        name: 'Meetings',
        dom: (
          <div className='management-container meeting'>
            {this.state.meetings.map((m) => <MeetingStrip
              data={m}
              editable={true}
              key={m.id}
              onError={this.props.onError}
              onDelete={this.updateMeetings}
            />)}
          </div>
        )
      }
    }

    if (!('auth' in localStorage) || this.state.deflect) return <Redirect to='/'/>

    return (
      <div className='app-container admin'>
        <h1>Admin Panel</h1>

        <div className='page-container'>
          {Object.entries(pages).map((p, i) => (
            <button
              className={`btn btn-${this.state.page === p[0] ? 'success' : 'primary'} page-button ${p[0]}`}
              onClick={() => this.setState({ page: p[0], index: null })}
              key={i}>
                {p[1].name}
            </button>
          ))}

          <span className={`material-symbols-outlined refresh-button${this.state.refreshed ? ' refreshed' : ''}`} onClick={this.refresh}>cached</span>
        </div>

        {pages[this.state.page].dom}

        {this.state.addingUser || this.state.addingTenant
          ? (
            <div className='create modal'>
              <div className='modal-dialogue'>
                <div className='modal-header'>
                  <h5 className='modal-title'>{this.state.addingUser ? 'Create User' : 'Register Tenant'}</h5>
                </div>

                <div className='modal-body'>
                  {this.state.addingUser
                    ? <UserBox
                      header='New User'
                      blank={true}
                      hide={['pass']}
                      onChange={(user) => this.setState({ addingUser: user })}
                      onError={this.props.onError}/>
                    : <TenantBox
                      header='New Tenant'
                      blank={true}
                      onChange={(tenant) => this.setState({ addingTenant: tenant })}
                      onError={this.props.onError}/>}
                </div>

                <div className='modal-footer'>
                  <button className='btn btn-success' onClick={this.state.addingUser
                    ? this.createUser.bind(this)
                    : this.createTenant.bind(this)} disabled={this.state.locked}>Create</button>

                  <button className='btn btn-secondary' onClick={() => this.setState({ addingUser: null, addingTenant: null })}>Cancel</button>
                </div>
              </div>
            </div>
            )
          : null}

        {this.state.deletingUser || this.state.deletingTenant
          ? (
            <div className='delete modal'>
              <div className='modal-dialogue'>
                <div className='modal-header'>
                  <h5 className='modal-title'>{this.state.deletingUser ? 'Delete User' : 'Unregsiter Tenant'}</h5>
                </div>

                <div className='modal-body'>
                  <p>Are you sure you want to {this.state.deletingUser ? 'delete' : 'unregsiter'} {this.state.deletingUser
                    ? this.state.deletingUser.firstname + ' ' + this.state.deletingUser.lastname
                    : this.state.deletingTenant.name}?</p>
                </div>

                <div className='modal-footer'>
                  <button className='btn btn-danger' onClick={this.state.deletingUser
                    ? this.deleteUser.bind(this, this.state.deletingUser.id)
                    : this.deleteTenant.bind(this, this.state.deletingTenant.id)}>Yes</button>

                  <button className='btn btn-secondary' onClick={() => this.setState({ deletingUser: null, deletingTenant: null })}>No</button>
                </div>
              </div>
            </div>
            )
          : null}
      </div>
    )
  }

  refresh () {
    const promises = [
      this.updateUsers(),
      this.updateMeetings(),
      this.updateTenants()
    ]

    return Promise.all(promises)
      .then(() => {
        this.setState({
          refreshed: true
        })

        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => this.setState({
          refreshed: false
        }), 2000)
      })
      .catch(this.props.onError)
  }

  updateUsers () {
    return fetch('/api/user/list', {
      method: 'GET',
      headers: {
        Authorization: localStorage.auth
      }
    })
      .then(postFetch)
      .then((users) => users.json())
      .then((users) => Promise.all(users.map((u) => fetch(`/api/user/${u.id}/name`)
        .then(postFetch)
        .then((user) => user.json())
        .then((user) => {
          return {
            ...u,
            ...user
          }
        }))))
      .then((users) => this.setState({ users }))
      .catch(this.props.onError)
  }

  updateTenants () {
    return fetch('/api/tenant/list', {
      method: 'GET'
    })
      .then(postFetch)
      .then((tenants) => tenants.json())
      .then((tenants) => this.setState({ tenants }))
      .catch(this.props.onError)
  }

  updateMeetings () {
    const promises = []

    for (let r = roomBounds[0]; r <= roomBounds[1]; r++) {
      promises.push(fetch('/api/room/list/' + r, {
        method: 'GET',
        headers: {
          Authorization: localStorage.auth
        }
      })
        .then(postFetch)
        .then((meetings) => meetings.json()))
    }

    return Promise.all(promises)
      .then((meetings) => this.setState({ meetings: meetings.flat() }))
      .catch(this.props.onError)
  }

  toggleIndex (index) {
    if (this.state.index === index) this.setState({ index: null })
    else this.setState({ index })
  }

  onChange (data) {
    this.setState({ addingPost: data })
  }

  createUser () {
    this.setState({
      locked: true
    })

    return fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.auth
      },
      body: JSON.stringify(this.state.addingUser)
    })
      .then(postFetch)
      .then((id) => id.status === 200 ? id.text() : id.json())
      .then((res) => {
        const user = {
          id: typeof res === 'string' ? res : res.id,
          ...this.state.addingUser
        }

        this.setState({
          addingUser: null,
          users: [
            ...this.state.users,
            user
          ]
        })
      })
      .catch(this.props.onError)
      .finally(() => this.setState({ locked: false }))
  }

  createTenant () {
    this.setState({
      locked: true
    })

    return fetch('/api/tenant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.auth
      },
      body: JSON.stringify(this.state.addingTenant)
    })
      .then(postFetch)
      .then(() => {
        this.updateTenants()

        this.setState({
          addingTenant: null
        })
      })
      .catch(this.props.onError)
      .finally(() => this.setState({ locked: false }))
  }

  deleteUser (id) {
    this.setState({
      deletingUser: null
    })

    return fetch('/api/user/' + id, {
      method: 'DELETE',
      headers: {
        Authorization: localStorage.auth
      }
    })
      .then(postFetch)
      .then(this.updateUsers)
      .catch(this.props.onError)
  }

  deleteTenant (id) {
    this.setState({
      deletingTenant: null
    })

    return fetch('/api/tenant/' + id, {
      method: 'DELETE',
      headers: {
        Authorization: localStorage.auth
      }
    })
      .then(postFetch)
      .then(this.updateTenants)
      .catch(this.props.onError)
  }
}

export default Admin
