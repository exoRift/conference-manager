import React from 'react'
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import {
  parse as parseQuery
} from 'query-string'

import Navbar from './Navbar.jsx'

import routes from './util/routes.js'

export default function Routes () {
  return (
    <Router>
      {parseQuery(window.location.search).ui === 'false' ? undefined : <Navbar/>}

      <div id='app'>
        {routes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            exact={route.exact}
            component={route.component}
          />
        ))}
      </div>
    </Router>
  )
}
