import React from 'react'

import Announcements from './util/Announcements.jsx'

import './styles/Home.css'

function Info () {
  return (
    <>
      INSERT INFO
    </>
  )
}

class Home extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      page: 'info'
    }

    this.onTabClick = this.onTabClick.bind(this)
  }

  onTabClick (event) {
    this.setState({
      page: event.target.id
    })
  }

  render () {
    this.pages = {
      info: (
        <Info/>
      ),
      announcements: (
        <Announcements/>
      )
    }

    return (
      <div className='homePage'>
        <div className='homeContainer'>
          <div className='tabContainer'>
            <input type='button' value='Info' onClick={this.onTabClick} id='info' active={String(this.state.page === 'info')}/>

            <input type='button' value='Announcements' onClick={this.onTabClick} id='announcements' active={String(this.state.page === 'announcements')}/>
          </div>

          {this.pages[this.state.page]}
        </div>
      </div>
    )
  }
}

export default Home
