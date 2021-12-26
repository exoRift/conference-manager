import React from 'react'
import Moment from 'react-moment'

class Clock extends React.Component {
  constructor (props) {
    super(props)

    this.refresh = setInterval(() => this.setState({}) /* Rerender */, this.props.interval || 1000)
  }

  componentWillUnmount () {
    clearInterval(this.refresh)
  }

  render () {
    return (
      <Moment
        className={this.props.className}
        format={this.props.format}
        date={this.format(new Date())}/>
    )
  }

  format (date) {
    if (this.props.countdown) {
      date.setHours(this.props.countdown.getHours() - date.getHours())
      date.setMinutes(this.props.countdown.getMinutes() - date.getMinutes())
      date.setSeconds(this.props.countdown.getSeconds() - date.getSeconds())

      return date
    } else return date
  }
}

export default Clock
