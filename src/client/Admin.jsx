import React from 'react'
import {
  Redirect
} from 'react-router-dom'

import postFetch from './util/postFetch.js'
import UserBox from './modules/UserBox.jsx'
import MeetingStrip from './modules/MeetingStrip.jsx'
// import PostEditor from './modules/PostEditor.jsx'
import {
  ReactComponent as RefreshSVG
} from '../assets/svg/refresh.svg'

import './styles/Admin.css'

const roomBounds = [1, 2]

const PostEditor = () => <></>

class Admin extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      page: 'users',
      users: [],
      meetings: [],
      posts: [],
      userIndex: null,
      postIndex: null,
      deletingUser: null,
      deletingPost: null,
      addingUser: null,
      addingPost: null,
      deflect: false,
      refreshed: false
    }

    this.updateUsers = this.updateUsers.bind(this)
    this.updateMeetings = this.updateMeetings.bind(this)
    this.updatePosts = this.updatePosts.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount () {
    fetch('/api/user/current/admin', {
      method: 'GET',
      headers: {
        Authorization: localStorage.auth
      }
    })
      .then(postFetch)
      .then((user) => user.json())
      .then(({ admin }) => {
        if (admin) {
          this.refresh()
        } else this.setState({ deflect: true })
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
                <div className={`index user${this.state.userIndex === i ? ' expanded' : ''}`} key={i}>
                  <div className='dropdown' onClick={this.toggleIndex.bind(this, i, 'userIndex')}>
                    <div className={'arrow ' + (this.state.userIndex === i ? 'down' : 'right')}/>
                  </div>

                  {this.state.userIndex === i
                    ? <UserBox
                      user={u.id}
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
      meetings: {
        name: 'Meetings',
        dom: (
          <div className='management-container meeting'>
            {this.state.meetings.map((m) => <MeetingStrip data={m} key={m.id} onError={this.props.onError} onDelete={this.updateMeetings} admin={true}/>)}
          </div>
        )
      },
      posts: {
        name: 'Building Announcements',
        dom: (
          <div className='management-container post'>
            <div className='add-container'>
              <button className='btn btn-success' onClick={() => this.setState({ addingPost: {} })}>+ Create Post</button>
            </div>

            <div className='post-list-container'>
              {this.state.posts.map((p, i) => (
                <div className={`index post${this.state.postIndex === i ? ' expanded' : ''}`} key={i}>
                  <div className='dropdown' onClick={this.toggleIndex.bind(this, i, 'postIndex')}>
                    <div className={'arrow ' + (this.state.postIndex === i ? 'down' : 'right')}/>
                  </div>

                  {this.state.postIndex === i
                    ? (
                        <PostEditor data={p} key={i} onError={this.props.onError}/>
                      )
                    : (
                      <>
                        <div className={'name'}>{p.title}</div>

                        <span className='delete-button post' onClick={() => this.setState({ deletingPost: p })}>Delete</span>
                      </>
                      )}
                </div>
              ))}
            </div>
          </div>
        )
      }
    }

    if ('auth' in localStorage && !this.state.deflect) {
      return (
        <div className='app-container admin'>
          <h1>Admin Panel</h1>
          <RefreshSVG className={`refresh-button${this.state.refreshed ? ' refreshed' : ''}`} onClick={this.refresh.bind(this)}/>

          <div className='page-container'>
            {Object.entries(pages).map((p, i) => (
              <button
                className={`btn btn-${this.state.page === p[0] ? 'success' : 'primary'} page-button ${p[0]}`}
                onClick={() => this.setState({ page: p[0] })}
                key={i}>
                  {p[1].name}
              </button>
            ))}
          </div>

          {pages[this.state.page].dom}

          {this.state.addingUser || this.state.addingPost
            ? (
              <div className='create modal'>
                <div className='modal-dialogue'>
                  <div className='modal-header'>
                    <h5 className='modal-title'>Create {this.state.addingUser ? 'User' : 'Post'}</h5>
                  </div>

                  <div className='modal-body'>
                    {this.state.addingUser
                      ? <UserBox
                        header='New User'
                        display={['name', 'email', 'suite', 'admin']}
                        blank={true}
                        onChange={(user) => this.setState({ addingUser: user })}
                        onError={this.props.onError}/>
                      : <PostEditor blank={true} onError={this.props.onError} onChange={this.onChange}/>}
                  </div>

                  <div className='modal-footer'>
                    <button className='btn btn-success' onClick={this.state.addingUser
                      ? this.createUser.bind(this)
                      : this.createPost.bind(this)} disabled={this.state.locked}>Create</button>

                    <button className='btn btn-secondary' onClick={() => this.setState({ addingUser: null, addingPost: null })}>Cancel</button>
                  </div>
                </div>
              </div>
              )
            : null}

          {this.state.deletingUser || this.state.deletingPost
            ? (
              <div className='delete modal'>
                <div className='modal-dialogue'>
                  <div className='modal-header'>
                    <h5 className='modal-title'>Delete {this.state.deletingUser ? 'User' : 'Post'}</h5>
                  </div>

                  <div className='modal-body'>
                    <p>Are you sure you want to delete {this.state.deletingUser
                      ? this.state.deletingUser.firstname + ' ' + this.state.deletingUser.lastname
                      : this.state.deletingPost.title}?</p>
                  </div>

                  <div className='modal-footer'>
                    <button className='btn btn-danger' onClick={this.state.deletingUser
                      ? this.deleteUser.bind(this, this.state.deletingUser.id)
                      : this.deletePost.bind(this, this.state.deletingPost.id)}>Yes</button>

                    <button className='btn btn-secondary' onClick={() => this.setState({ deletingUser: null, deletingPost: null })}>No</button>
                  </div>
                </div>
              </div>
              )
            : null}
        </div>
      )
    } else return <Redirect to={this.state.redirect}/>
  }

  refresh () {
    const promises = [
      this.updateUsers(),
      this.updateMeetings(),
      this.updatePosts()
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

  updatePosts () {
    fetch('/api/post/list/100', {
      method: 'GET',
      headers: {
        Authorization: localStorage.auth
      }
    })
      .then(postFetch)
      .then((posts) => posts.json())
      .then((posts) => this.setState({ posts }))
      .catch(this.props.onError)
  }

  toggleIndex (index, state) {
    if (this.state[state] === index) this.setState({ [state]: null })
    else this.setState({ [state]: index })
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

  createPost () {
    this.setState({
      locked: true
    })

    return fetch('/api/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.auth
      },
      body: JSON.stringify(this.state.addingPost)
    })
      .then(postFetch)
      .then(() => {
        this.updatePosts()

        this.setState({
          addingPost: null
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

  deletePost (id) {
    this.setState({
      deletingPost: null
    })

    return fetch('/api/post/' + id, {
      method: 'DELETE',
      headers: {
        Authorization: localStorage.auth
      }
    })
      .then(postFetch)
      .then(this.updatePosts)
      .catch(this.props.onError)
  }
}

export default Admin
