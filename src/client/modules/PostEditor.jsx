import React from 'react'

import MarkdownEditor from '@uiw/react-md-editor'
import postFetch from '../util/postFetch.js'

import '../styles/PostEditor.css'

class UserBox extends React.Component {
  static defaultProps = {
    data: {},
    blank: false
  }

  constructor (props) {
    super(props)

    this.state = {
      creator: null,
      alter: {},
      success: false
    }
  }

  componentDidMount () {
    if (!this.props.blank) {
      return fetch(`/api/user/${this.props.data.creator}/name`, {
        method: 'GET'
      })
        .then(postFetch)
        .then((creator) => creator.json())
        .then((creator) => this.setState({ creator }))
        .catch(this.props.onError)
    }
  }

  componentWillUnmount () {
    clearTimeout(this.timeout)
  }

  render () {
    return (
      <form className={`postbox${this.state.success ? ' success' : ''}`} onSubmit={this.submit.bind(this)}>
        <div className='form-group'>
          <label htmlFor={'title'}>Title</label>
          <input
            className='form-control'
            id='title'
            value={this.state.alter.title ?? this.props.data.title ?? ''}
            onChange={this.onChange.bind(this, 'title')}/>

          <label htmlFor={'content'}>Content</label>
          <MarkdownEditor
            value={this.state.alter.content ?? this.props.data.content ?? ''}
            onChange={this.onChange.bind(this, 'content')}
            id={'content'}/>

          <div className='footer'>
            {this.props.blank
              ? null
              : <button type='submit' className='btn btn-primary btn-success'>Save Changes</button>}

            {this.props.blank
              ? null
              : <span className='creator'>
                  Creator: {this.state.creator ? `${this.state.creator.firstname} ${this.state.creator.lastname}` : this.props.data.creator}
                </span>}
          </div>
        </div>
      </form>
    )
  }

  onChange (field, event) {
    const altered = {
      ...this.state.alter,
      [field]: field === 'content' ? event : event.target.value
    }

    this.props.onChange?.(altered)

    this.setState({
      alter: altered
    })
  }

  submit (event) {
    event.preventDefault()

    if (Object.keys(this.state.alter).length) {
      fetch('/api/post/' + this.props.data.id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.auth
        },
        body: JSON.stringify(this.state.alter)
      })
        .then(postFetch)
        .then(() => {
          this.setState({
            success: true
          })

          clearTimeout(this.timeout)
          this.timeout = setTimeout(() => this.setState({
            success: false
          }), 3000)
        })
        .catch(this.props.onError)
    }
  }
}

export default UserBox
