import Home from '../Home.jsx'
import Account from '../Account.jsx'
import Login from '../Login.jsx'
import Register from '../Register.jsx'
import Directory from '../Directory.jsx'
import RoomPanel from '../RoomPanel.jsx'
import Admin from '../Admin.jsx'
import Manager from '../Manager.jsx'

const routes = [
  {
    path: '/',
    exact: true,
    name: 'Home',
    Component: Home
  },
  {
    path: '/account',
    name: 'My Account',
    hidden: true,
    Component: Account
  },
  {
    path: '/login',
    name: 'Login',
    hidden: true,
    Component: Login
  },
  {
    path: '/register/:id',
    name: 'Register Account',
    hidden: true,
    Component: Register
  },
  {
    path: '/manager',
    name: 'My Meetings',
    accountOnly: true,
    Component: Manager
  },
  {
    path: '/meetings',
    name: 'Directory',
    exact: true,
    Component: Directory
  },
  {
    path: '/tenants',
    name: 'Tenants',
    exact: true,
    Component: Directory,
    hidden: true
  },
  {
    path: '/meetings/:room',
    name: 'Room Panel',
    hidden: true,
    Component: RoomPanel
  },
  {
    path: '/admin',
    name: 'Admin Panel',
    hidden: true,
    Component: Admin
  }
]

export default routes
