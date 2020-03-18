import React from 'react'

import MDParser from 'react-markdown'

const {
  REACT_APP_API_URL
} = process.env

class Announcements extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      announcements: null
    }
  }

  componentDidMount () {
    fetch(REACT_APP_API_URL + '/announcement/all', {
      headers: {
        Accept: 'application/json'
      }
    })
      .then((data) => data.json())
      .then((anns) => Promise.all(anns.map(async (a) => {
        a.creator = await fetch(`${REACT_APP_API_URL}/user/${a.creator}/name`, {
          headers: {
            Accept: 'text/plain'
          }
        }).then((data) => data.text())

        return a
      })))
      .then((announcements) => this.setState({
        announcements
      }))
  }

  render () {
    return (
      <>
        {this.state.announcements ? this.state.announcements.map((a) => (
          <div className='announcementCard' key={a.id}>
            <div className='header'>
              <div className='title'>
                <h2>{a.title}</h2>
              </div>

              <div className='author'>
                <h4>{a.creator}</h4>
              </div>
            </div>

            <div id='divider'/>

            <MDParser source={a.content} escapeHtml={false}/>

            <div className='timestamp'>
              <h6>{new Date(a.timestamp).toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short'
              })}</h6>
            </div>
          </div>
        )) : null}
      </>
    )
  }
}

export default Announcements
