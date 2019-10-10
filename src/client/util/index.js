import React from 'react'
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'

function router (routes) {
  return (
    <Router>
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          exact={route.exact}
          component={route.component}
        />
      ))}
    </Router>
  )
}

function getConfStatus (conf) {
  const time = Date.now()

  if (time > conf.endtime) return 'over'
  else if (time > conf.starttime && time < conf.endtime) return 'active'
  else if (conf.starttime - time <= 7200000) return 'soon'
  else return 'upcoming'
}

export {
  getConfStatus,
  router
}
