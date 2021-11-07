import React from 'react'

import Error from './Error.jsx'

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      error: null
    }
  }

  static getDerivedStateFromError (error) {
    return {
      error
    }
  }

  render () {
    if (this.state.error) return <Error error={this.state.error} onClose={() => this.setState({ error: null })}/>
    else return this.props.children
  }
}

export default ErrorBoundary
