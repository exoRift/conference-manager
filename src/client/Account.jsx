import React from 'react'
import {
  Redirect
} from 'react-router-dom'

import UserBox from './modules/UserBox.jsx'
import interior from '../assets/images/interior.jpg'
import {
  ReactComponent as LogoutSVG
} from '../assets/svg/logout.svg'
import {
  ReactComponent as AdminSVG
} from '../assets/svg/admin.svg'

import './styles/Account.css'

class Account extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      user: {},
      redirect: null
    }

    this.logout = this.logout.bind(this)
    this.onInfo = this.onInfo.bind(this)
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect}/>
    else if ('auth' in localStorage) {
      return (
        <div className='app-container account interior-bg' style={{ backgroundImage: `url(${interior})` }}>
          <UserBox
            user='current'
            header='Account'
            display={['name', 'email', 'suite', 'entity', 'pass']}
            locked={['suite']}
            onSuccess={(token) => localStorage.setItem('auth', token)}
            onError={this.props.onError}
            onInfo={this.onInfo}>
              <div className='nav-container'>
                <div className='admin-container' onClick={() => this.redirect('/admin')}>
                  {this.state.user.admin
                    ? (
                      <>
                        <AdminSVG/>

                        <strong>Admin Panel</strong>
                      </>
                      )
                    : null}
                </div>

                <div className='logout-container' onClick={this.logout}>
                  <LogoutSVG/>

                  <strong>Logout</strong>
                </div>
              </div>
            </UserBox>
        </div>
      )
    } else return <Redirect to='/login'/>
  }

  logout () {
    localStorage.removeItem('auth')

    this.forceUpdate() // Rerender for redirect

    this.props.refreshNav()
  }

  redirect (path) {
    this.setState({
      redirect: path
    })
  }

  onInfo (user) {
    this.setState({ user })
  }
}

export default Account
