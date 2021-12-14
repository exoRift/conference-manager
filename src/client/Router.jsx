import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'
import {
  parse as parseQuery
} from 'query-string'

import Navbar from './modules/Navbar.jsx'
import UserButton from './modules/UserButton.jsx'
import Error from './modules/Error.jsx'

import routes from './util/routes.js'
import NotFound from './NotFound.jsx'

class Routes extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      error: null,
      navRefreshFlag: false
    }

    this.onError = this.onError.bind(this)
    this.closeError = this.closeError.bind(this)
    this.refreshNav = this.refreshNav.bind(this)

    this.query = parseQuery(window.location.search)
  }

  componentWillUnmount () {
    clearTimeout(this.errorTimeout)
  }

  render () {
    return (
      <Router>
        {this.query.ui === 'false' ? undefined : <Navbar routes={routes} refreshFlag={this.state.navRefreshFlag}/>}

        <div id='app'>
          <Switch>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
                render={(props) => <route.Component onError={this.onError} refreshNav={this.refreshNav} query={this.query} {...props}/>}
              />
            ))}

            <Route component={NotFound}/>
          </Switch>
        </div>

        {this.query.ui === 'false' ? undefined : <UserButton onError={this.onError}/>}

        {this.state.error
          ? <Error error={this.state.error} onClose={this.closeError}/>
          : null}
      </Router>
    )
  }

  onError (error) {
    this.setState({
      error
    })

    clearTimeout(this.errorTimeout)
    this.errorTimeout = setTimeout(() => this.setState({ error: null }), 300000 /* 5 minutes */)
  }

  closeError () {
    clearTimeout(this.errorTimeout)

    this.setState({
      error: null
    })
  }

  refreshNav () {
    this.setState({
      navRefreshFlag: !this.state.navRefreshFlag
    })
  }
}

export default Routes
