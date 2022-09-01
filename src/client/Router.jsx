import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from 'react-router-dom'
import {
  parse as parseQuery
} from 'query-string'

import Error from './modules/Error.jsx'

import routes from './util/routes.js'
import NotFound from './NotFound.jsx'

class Routes extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      error: null
    }

    this.onError = this.onError.bind(this)
    this.closeError = this.closeError.bind(this)

    this.query = parseQuery(window.location.search)

    // Silk doesn't support query params
    this.hideUI = this.query.ui === 'false' || navigator.userAgent.toLowerCase().includes('silk')
  }

  componentWillUnmount () {
    clearTimeout(this.errorTimeout)
  }

  render () {
    return (
      <Router>
        <div id='app'>
          {this.hideUI
            ? null
            : (
                <NavLink to='/' exact={true} className='home-button'>
                  Return Home
                </NavLink>
              )}

          <Switch>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
                render={(props) => <route.Component
                  onError={this.onError}
                  refreshNav={this.refreshNav}
                  query={this.query}
                  hideUI={this.hideUI}
                  {...props}
                />}
              />
            ))}

            <Route component={NotFound}/>
          </Switch>
        </div>

        {this.state.error
          ? <Error error={this.state.error} onClose={this.closeError}/>
          : null}
      </Router>
    )
  }

  onError (error) {
    console.error(error)

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
}

export default Routes
