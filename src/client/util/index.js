import React from 'react'
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom'
import errorMsgs from '../../assets/errors.json'

const errMsgRegex = /{(.+?)}/g

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

function formatError (err) {
  if (err instanceof Error) err = err.message

  // CHECK FOR TYPE ERRORS

  const data = [
    ...err.matchAll(errMsgRegex)
  ].map((m) => m[1])

  return errorMsgs
    .find((e) => err.startsWith(e[0]))[1]
    .replace(errMsgRegex, (match, param) => data[param])
}

export {
  getConfStatus,
  router,
  formatError
}
