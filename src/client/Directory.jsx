import React from 'react'

import postFetch from './util/postFetch.js'
import entrance from '../assets/images/entrance.jpg'

import './styles/Directory.css'

class Directory extends React.Component {
  state = {
    tenants: []
  }

  constructor (props) {
    super(props)

    this.update = this.update.bind(this)
  }

  componentDidMount () {
    this.update()

    this.updateInterval = setInterval(this.update, 600000 /* 10 minutes */)
  }

  componentWillUnmount () {
    this.updateInterval = clearInterval(this.updateInterval)
  }

  render () {
    return (
      <div className='app-container directory' style={{ backgroundImage: `url(${entrance})` }}>
        <h1>Directory</h1>

        <div className='tenant-list'>
          {this.state.tenants.map((t, i) => (
            <div className='tenant-card' key={i}>
              <div className='header'>
                <span className='suite'>{t.suite}</span>

                <span className='material-symbols-outlined'>
                  {Number(t.suite.slice(0, 3)) > 103 ? 'arrow_upward' : 'arrow_downward'}
                  stairs
                </span>
              </div>

              <div className='body'>
                <span>{t.tenant}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  update () {
    return fetch('/api/tenant/list', {
      method: 'GET'
    })
      .then(postFetch)
      .then((tenants) => tenants.json())
      .then((tenants) => this.setState({ tenants }))
      .catch(this.props.onError)
  }
}

export default Directory
