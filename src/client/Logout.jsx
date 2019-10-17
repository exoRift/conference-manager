import React from 'react'
import {
  Redirect
} from 'react-router-dom'

export default function Logout () {
  localStorage.removeItem('auth')

  setTimeout(() => window.location.reload(), 500)

  return (
    <Redirect to='/'/>
  )
}
