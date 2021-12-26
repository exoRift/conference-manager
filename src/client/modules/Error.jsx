import React from 'react'
import {
  Redirect
} from 'react-router-dom'

class Error extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      status: null,
      error: {}
    }
  }

  componentDidMount () {
    this.update()
  }

  componentDidUpdate (prevProps) {
    if (this.props !== prevProps) this.update()
  }

  render () {
    if (this.state.error.message === 'invalid token') {
      localStorage.removeItem('auth')

      this.props.onClose()

      return <Redirect to='/login?error=logged_out'/>
    } else {
      return (
        <div className='alert alert-dismissible alert-danger error'>
          <button type='button' className='close' data-dismiss='alert' onClick={this.props.onClose}>&times;</button>

          <strong className='header'>Something went wrong.</strong>

          <div className='message'>
            <span className='code'>{this.state.status}</span> <strong className='type'>{this.state.error.type}</strong> {this.state.error.message}
          </div>
        </div>
      )
    }
  }

  update () {
    if (this.props.error instanceof TypeError) {
      this.setState({
        error: {
          type: 'network',
          message: 'could not resolve host'
        }
      })
    } else if (this.props.error instanceof Response) {
      this.props.error.json()
        .then(({ error }) => this.setState({ error, status: this.props.error.status }))
    } else this.setState({ error: this.props.error })
  }
}

export default Error
