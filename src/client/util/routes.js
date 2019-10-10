import Home from '../Home.jsx'
import Directory from '../Directory.jsx'
import Rooms from '../Rooms.jsx'
import Room from '../Room.jsx'

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
  }
]

export default routes
