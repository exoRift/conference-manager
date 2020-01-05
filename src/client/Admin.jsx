import React from 'react'
import {
  Redirect
} from 'react-router-dom'

import ConferenceManager from './util/ConferenceManager'
import UserManager from './util/UserManager'

import './styles/Admin.css'

const {
  REACT_APP_API_URL
} = process.env

class Admin extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      waiting: true,
      verified: false,
      page: 'users'
    }

    this._refs = {
      users: React.createRef(),
      confs: React.createRef()
    }

    this.onTabClick = this.onTabClick.bind(this)
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

  render () {
    this.pages = {
      users: (
        <UserManager ref={this._refs.users}/>
      ),
      confs: (
        <ConferenceManager ref={this._refs.confs}/>
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
          </div>

          <div className='managementContainer'>
            {this.pages[this.state.page]}

            <div className='submitContainer'>
              <button onClick={() => this.pages[this.state.page].ref.current.onSubmit()}>Save changes</button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <Redirect to='/'/>
    )
  }
}

export default Admin
