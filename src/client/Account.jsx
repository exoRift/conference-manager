import React from 'react'
import {
  Redirect
} from 'react-router-dom'

import UserBox from './modules/UserBox.jsx'
import TenantBox from './modules/TenantBox.jsx'

import interior from '../assets/images/interior.jpg'

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
            user='self'
            header='My Account'
            locked={['tenant']}
            onSuccess={(token) => localStorage.setItem('auth', token)}
            onError={this.props.onError}
            onInfo={this.onInfo}>
            <div className='nav-container'>
              <div className='admin-container' onClick={() => this.redirect('/admin')}>
                {this.state.user.admin
                  ? (
                    <>
                      <span className='material-symbols-outlined'>
                        security
                      </span>

                      <strong>Admin Panel</strong>
                    </>
                    )
                  : null}
              </div>

              <div className='logout-container' onClick={this.logout}>
                <span className='material-symbols-outlined'>
                  logout
                </span>

                <strong>Logout</strong>
              </div>
            </div>
          </UserBox>

          {this.state.user?.tenant
            ? <TenantBox
              id={this.state.user.tenant}
              header='Tenant Info'
              locked={['suite']}
              onError={this.props.onError}/>
            : null}
        </div>
      )
    } else return <Redirect to='/login'/>
  }

  logout () {
    localStorage.removeItem('auth')

    this.forceUpdate() // Rerender for redirect
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
