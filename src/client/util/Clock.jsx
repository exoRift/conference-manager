import React from 'react'

class Clock extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      date: new Date()
    }
  }

  componentDidMount () {
    this.timer = setInterval(() => this.tick(), 1000)
  }

  componentWillUnmount () {
    clearInterval(this.timer)
  }

  tick () {
    this.setState({
      date: new Date()
    })
  }

  render () {
    return (
      <strong>{this.state.date.toLocaleTimeString('en-US').slice(0, -3)}</strong>
    )
  }
}

export default Clock
