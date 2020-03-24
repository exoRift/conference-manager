import React from 'react'

import Popup from './Popup.jsx'

import trashIcon from '../../assets/trash.svg'

const {
  REACT_APP_API_URL
} = process.env

class AnnouncementManager extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      announcements: [],
      readyDelete: undefined
    }

    this.readyDelete = this.readyDelete.bind(this)
    this.unreadyDelete = this.unreadyDelete.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.create = this.create.bind(this)
    this.edit = this.edit.bind(this)
  }

  componentDidMount () {
    return fetch(REACT_APP_API_URL + '/announcement/all', {
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

  readyDelete (ann) {
    return () => {
      this.setState({
        readyDelete: {
          id: ann.id,
          ann: ann.title
        }
      })
    }
  }

  unreadyDelete () {
    this.setState({
      readyDelete: undefined
    })
  }

  onDelete (ann) {
    return () => {
      fetch(`${REACT_APP_API_URL}/announcement/${ann}/delete`, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('auth')
        }
      }).then((data) => {
        if (data.ok) {
          const changes = [
            ...this.state.announcements
          ]

          changes.splice(changes.findIndex((a) => a.id === ann), 1)

          this.setState({
            announcements: changes,
            readyDelete: undefined
          })
        }
      })
    }
  }

  async create (announcement) {
    return fetch(REACT_APP_API_URL + (this.state.announcements.find((a) => a.id === announcement.id) ? `/announcement/${announcement.id}/update` : '/announcement/create'), {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('auth'),
        'Content-Type': 'application/json',
        Accept: 'text/plain'
      },
      body: JSON.stringify(announcement)
    })
      .then((data) => {
        return data.text().then((content) => {
          if (data.ok) {
            return this.componentDidMount().then(() => {
              return {
                id: content,
                ...announcement
              }
            })
          } else {
            const err = Error(content)
            err.code = data.status

            throw err
          }
        })
      })
  }

  edit (announcement) {
    return () => this.props.edit(announcement)
  }

  render () {
    return (
      <>
        {
          this.state.readyDelete ? (
            <Popup message={`Are you sure you want to delete ${this.state.readyDelete.ann}?`} noChoice={this.unreadyDelete} yesChoice={this.onDelete(this.state.readyDelete.id)}/>
          ) : null
        }
        <div className='anns'>
          <div className='annContainer'>
            {this.state.announcements.map((a) => (
              <div className='objectContainer' key={a.id}>
                <div className='data'>
                  <div className='dataBox' id='title'>{a.title}</div>

                  <span>-</span>

                  <div className='dataBox' id='creator'>{a.creator}</div>

                  <div className='trashContainer' id='enabled' onClick={this.readyDelete(a)}>
                    <div className='imgContainer'>
                      <img src={trashIcon} alt='delete'/>
                    </div>
                  </div>

                  <button type='button' onClick={this.edit(a)} id={a.id}>{'\u270E'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }
}

AnnouncementManager.propTypes = {
  edit: () => null
}

export default AnnouncementManager
