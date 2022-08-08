import React from 'react'
import {
  Link,
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
      user: {}
    }

    this.logout = this.logout.bind(this)
    this.onInfo = this.onInfo.bind(this)
  }

  render () {
    if (this.state.redirect) return <Redirect to={this.state.redirect}/>

    return (
      <div className='app-container account interior-bg' style={{ backgroundImage: `url(${interior})` }}>
        <UserBox
          id='self'
          header='My Account'
          hide={['admin']}
          locked={['tenant']}
          onSuccess={(token) => localStorage.setItem('auth', token)}
          onError={this.props.onError}
          onInfo={this.onInfo}
          >
            <div className='nav-container'>
              <Link to='/admin' className='admin-container'>
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
              </Link>

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
  }

  logout () {
    localStorage.removeItem('auth')

    this.setState({
      redirect: '/'
    })
  }

  onInfo (user) {
    this.setState({ user })
  }
}

export default Account
