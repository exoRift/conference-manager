import React from 'react'
import {
  Link
} from 'react-router-dom'

import {
  ReactComponent as MagnifierSVG
} from '../assets/svg/broken_magnifier.svg'

import './styles/NotFound.css'

function NotFound () {
  return (
    <div className='app-container notfound'>
      <MagnifierSVG className='backdrop'/>

      <Link id='return' to='/'>&#8617;&#xfe0e;</Link>

      <div className='header'>404</div>

      <div className='subheader'>Page not found</div>
    </div>
  )
}

export default NotFound
