import React from 'react'

import postFetch from './util/postFetch.js'
import entrance from '../assets/images/entrance.jpg'

import './styles/Directory.css'

class Directory extends React.Component {
  static startingFontSize = 300

  state = {
    tenants: []
  }

  list = React.createRef()

  calibrated = false

  constructor (props) {
    super(props)

    this.update = this.update.bind(this)
  }

  componentDidMount () {
    this.update()

    this.updateInterval = setInterval(this.update, 600000 /* 10 minutes */)
  }

  componentDidUpdate () {
    const calibrateInterval = setInterval(() => {
      if (document.readyState === 'complete') {
        clearInterval(calibrateInterval)

        for (let s = Directory.startingFontSize; s > 0; s--) {
          this.list.current.style.setProperty('--card-font-size', s + '%')

          if (this.list.current.scrollHeight <= this.list.current.clientHeight) break
        }
      }
    }, 200)
  }

  componentWillUnmount () {
    clearInterval(this.updateInterval)
  }

  render () {
    return (
      <div className='app-container directory' style={{ backgroundImage: `url(${entrance})` }}>
        <h1>Directory</h1>

        <div className='tenant-list' ref={this.list}>
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
                <span>{t.name}</span>
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
