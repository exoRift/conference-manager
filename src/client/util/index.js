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
  const startTime = new Date(conf.starttime).getTime()
  const endTime = new Date(conf.endtime).getTime()

  const time = Date.now()

  if (time > endTime) return 'over'
  else if (time > startTime && time < endTime) return 'active'
  else if (conf.startTime - time <= 7200000) return 'soon'
  else return 'upcoming'
}

export {
  getConfStatus,
  router
}
