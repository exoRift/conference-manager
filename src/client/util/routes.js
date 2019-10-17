import Home from '../Home.jsx'
import Directory from '../Directory.jsx'
import Rooms from '../Rooms.jsx'
import Room from '../Room.jsx'
import Login from '../Login.jsx'
import Account from '../Account.jsx'
import Logout from '../Logout.jsx'

const routes = [
  {
    path: '/',
    exact: true,
    name: 'Home',
    component: Home
  },
  {
    path: '/directory',
    name: 'Directory',
    component: Directory
  },
  {
    path: '/rooms',
    name: 'Specific Conference Room',
    component: Rooms
  },
  {
    path: '/room',
    component: Room,
    hidden: true
  },
  {
    path: '/login',
    component: Login,
    hidden: true
  },
  {
    path: '/account',
    component: Account,
    hidden: true
  },
  {
    path: '/logout',
    component: Logout,
    hidden: true
  }
]

export default routes
