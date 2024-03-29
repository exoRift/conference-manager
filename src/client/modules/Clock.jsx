import React from 'react'

class Clock extends React.Component {
  constructor (props) {
    super(props)

    this.refresh()

    this.interval = setInterval(() => {
      this.refresh()

      this.setState({})
    }, this.props.interval || 1000)
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  render () {
    return this.format(this.date)
  }

  refresh () {
    this.date = this.finalizeDate(this.props.date || new Date())
  }

  finalizeDate (date) {
    if (this.props.countdown) {
      date.setHours(this.props.countdown.getHours() - date.getHours())
      date.setMinutes(this.props.countdown.getMinutes() - date.getMinutes())
      date.setSeconds(this.props.countdown.getSeconds() - date.getSeconds())

      return date
    } else return date
  }

  format (date) {
    return this.props.format
      .replace('HH', date.getHours().toString().padStart(2, '0'))
      .replace('h', date.getHours() % 12 || 12)
      .replace('mm', date.getMinutes().toString().padStart(2, '0'))
      .replace('ss', date.getSeconds().toString().padStart(2, '0'))
      .replace('a', date.getHours() >= 12 ? 'pm' : 'am')
  }
}

export default Clock
