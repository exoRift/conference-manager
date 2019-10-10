import React from 'react'
import ReactDOM from 'react-dom'

import './client/styles/bootstrap.min.css'
import './client/styles/index.css'

import Router from './client/Router.jsx'

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

ReactDOM.render(<Router/>, document.getElementById('root'))
