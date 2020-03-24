import React from 'react'
import {
  Redirect
} from 'react-router-dom'

import ConferenceManager from './util/ConferenceManager.jsx'
import UserManager from './util/UserManager.jsx'
import AnnouncementManager from './util/AnnouncementManager.jsx'

import plusIcon from '../assets/plus.png'

import './styles/Admin.css'

import {
  formatError
} from './util/'

const {
  REACT_APP_API_URL
} = process.env

class Admin extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      waiting: true,
      verified: false,
      page: 'users',
      addingUser: null,
      addingAnnouncement: null,
      saving: false,
      error: null
    }

    this._refs = {
      users: React.createRef(),
      confs: React.createRef(),
      anns: React.createRef()
    }

    this.onTabClick = this.onTabClick.bind(this)
    this.addUser = this.addUser.bind(this)
    this.addAnnouncement = this.addAnnouncement.bind(this)
    this.addChange = this.addChange.bind(this)
    this.cancelAdd = this.cancelAdd.bind(this)
    this.onAdd = this.onAdd.bind(this)
  }

  componentDidMount () {
    fetch(REACT_APP_API_URL + '/user/current/admin', {
      headers: {
        Authorization: localStorage.getItem('auth'),
        Accept: 'text/plain'
      }
    }).then((data) => {
      if (data.ok) {
        data.text().then((admin) => this.setState({
          waiting: false,
          verified: JSON.parse(admin)
        }))
      } else {
        this.setState({
          waiting: false
        })
      }
    })
  }

  onTabClick (event) {
    this.setState({
      page: event.target.id
    })
  }

  addUser () {
    this.setState({
      addingUser: {}
    })
  }

  addAnnouncement (data) {
    this.setState({
      addingAnnouncement: {
        ...data
      }
    })
  }

  addChange (type) {
    return (event) => {
      if (type === 'user') {
        this.setState({
          addingUser: {
            ...this.state.addingUser,
            [event.target.id]: event.target.value
          }
        })
      } else {
        this.setState({
          addingAnnouncement: {
            ...this.state.addingAnnouncement,
            [event.target.id]: event.target.value
          }
        })
      }
    }
  }

  cancelAdd () {
    this.setState({
      addingUser: null,
      addingAnnouncement: null,
      error: null
    })
  }

  onAdd () {
    this.setState({
      saving: true
    })

    const creation = this.state.addingUser ? this._refs.users.current.create(this.state.addingUser) : this._refs.anns.current.create(this.state.addingAnnouncement)

    creation
      .then((res) => {
        this.setState({
          saving: false,
          addingUser: null,
          addingAnnouncement: null,
          error: null
        })
      })
      .catch((err) => {
        this.setState({
          saving: false,
          error: formatError(err.message)
        })
      })
  }

  render () {
    this.pages = {
      users: (
        <UserManager ref={this._refs.users}/>
      ),
      confs: (
        <ConferenceManager ref={this._refs.confs}/>
      ),
      anns: (
        <AnnouncementManager ref={this._refs.anns} edit={this.addAnnouncement}/>
      )
    }

    if (this.state.waiting) {
      return (
        <div className='loadingContainer'>
          <font className='loadingText'>Loading...</font>
        </div>
      )
    }

    if (this.state.verified) {
      return (
        <div className='adminContainer'>
          <div className='tabContainer'>
            <input type='button' value='Users' onClick={this.onTabClick} id='users' active={String(this.state.page === 'users')}/>

            <input type='button' value='Conferences' onClick={this.onTabClick} id='confs' active={String(this.state.page === 'confs')}/>

            <input type='button' value='Announcements' onClick={this.onTabClick} id='anns' active={String(this.state.page === 'anns')}/>
          </div>

          <div className='managementContainer'>
            {this.pages[this.state.page]}

            {this.state.page === 'users' ? (
              <div className='addContainer' onClick={this.addUser}>
                <div className='plus'>
                  <img src={plusIcon} alt='plus'/>
                </div>
              </div>
            ) : null}

            {this.state.page === 'anns' ? (
              <div className='addContainer' onClick={this.addAnnouncement.bind(this, [])}>
                <div className='plus'>
                  <img src={plusIcon} alt='plus'/>
                </div>
              </div>
            ) : null}

            <div className='submitContainer'>
              <button onClick={() => this.pages[this.state.page].ref.current.onSubmit()}>Save changes</button>
            </div>
          </div>

          {this.state.addingUser ? (
            <div className='addItemContainer' id='popup'>
              <div className='closeContainer' onClick={this.cancelAdd}>
                <div className='closeButton'>
                  <div className='xContainer'>
                    <span>X</span>
                  </div>
                </div>
              </div>

              <div className='messageContainer'>
                <h1>Add a user</h1>
              </div>

              <div className='inputContainer'>
                <div className='inputBox name'>
                  <h2>Name</h2>
                  <input value={this.state.addingUser.name || ''} onChange={this.addChange('user')} id='name'/>
                </div>

                <div className='inputBox email'>
                  <h2>Email</h2>
                  <input value={this.state.addingUser.email || ''} onChange={this.addChange('user')} id='email'/>
                </div>
              </div>

              <div className='submitContainer'>
                <button onClick={this.state.saving ? null : this.onAdd} id={this.state.saving ? 'saving' : 'ready'}>Add</button>
              </div>

              {this.state.error ? (
                <div className='errorContainer'>
                  <h3 className='error'>{this.state.error}</h3>
                </div>
              ) : null}
            </div>
          ) : null}

          {this.state.addingAnnouncement ? (
            <div className='addItemContainer' id='popup'>
              <div className='closeContainer' onClick={this.cancelAdd}>
                <div className='closeButton'>
                  <div className='xContainer'>
                    <span>X</span>
                  </div>
                </div>
              </div>

              <div className='messageContainer'>
                <h1>Create an announcement</h1>
              </div>

              <div className='inputContainer noflex'>
                <div className='inputBox title'>
                  <h2>Title</h2>
                  <input value={this.state.addingAnnouncement.title || ''} onChange={this.addChange('ann')} id='title'/>
                </div>

                <div className='inputBox content'>
                  <h2>Content</h2>
                  <textarea value={this.state.addingAnnouncement.content || ''} onChange={this.addChange('ann')} id='content'/>
                </div>
              </div>

              <div className='submitContainer'>
                <button onClick={this.state.saving ? null : this.onAdd} id={this.state.saving ? 'saving' : 'ready'}>Add</button>
              </div>

              {this.state.error ? (
                <div className='errorContainer'>
                  <h3 className='error'>{this.state.error}</h3>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )
    }

    return (
      <Redirect to='/'/>
    )
  }
}

export default Admin
