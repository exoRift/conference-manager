import React from 'react'
import {
  Link
} from 'react-router-dom'

import routes from './util/routes.js'

import './styles/Navbar.css'

export default function Navbar () {
  return (
    <div id='navbar'>
    {routes.map((route, index) => route.hidden ? undefined : (
      <div className='routeContainer' key={index}>
        <Link to={route.path}>
          <h4>{route.name}</h4>
        </Link>

        <div className='divider'></div>
      </div>
    ))}
  </div>
  )
}
