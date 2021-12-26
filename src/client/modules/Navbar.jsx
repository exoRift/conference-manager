import React from 'react'
import {
  Link
} from 'react-router-dom'

import '../styles/Navbar.css'

function Navbar (props) {
  return (
    <div id='navbar'>
      <div className='routes'>
        {props.routes.map((route, index) => route.hidden || (route.accountOnly && !('auth' in localStorage))
          ? null
          : <Link className='route' key={index} to={route.path}>{route.name}</Link>
        )}
      </div>
    </div>
  )
}

export default Navbar
