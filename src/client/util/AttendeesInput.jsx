import React from 'react'

import Autocomplete from 'react-autocomplete-input'

import 'react-autocomplete-input/dist/bundle.css'

class AttendeesInput extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      attendees: props.attendees,
      focused: false,
      current: ''
    }

    this.onFocus = this.onFocus.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.onChange = this.onChange.bind(this)
    this.removeAttendee = this.removeAttendee.bind(this)
  }

  onFocus () {
    this.setState({
      focused: true
    })
  }

  onBlur () {
    this.setState({
      focused: false
    })
  }

  onChange (value) {
    if (value.trim().endsWith(',')) {
      const name = value.trim().slice(0, -1)

      if (this.state.attendees.includes(name)) {
        return this.setState({
          current: ''
        })
      }

      const changes = [
        ...this.state.attendees,
        name
      ]

      this.setState({
        attendees: changes,
        current: ''
      })

      this.props.onChange({
        target: {
          value: changes,
          id: 'attendees'
        }
      })
    } else {
      this.setState({
        current: value
      })
    }
  }

  removeAttendee (attendee) {
    return () => {
      const index = this.state.attendees.indexOf(attendee)

      const changes = [
        ...this.state.attendees.slice(0, index),
        ...this.state.attendees.slice(index + 1, this.state.attendees.length)
      ]

      this.setState({
        attendees: changes
      })

      this.props.onChange({
        target: {
          value: changes,
          id: 'attendees'
        }
      })
    }
  }

  render () {
    this.input = (
      <Autocomplete
        options={this.props.users ? this.props.users.map((u) => u.name) : []}
        Component='input'
        matchAny={true}
        trigger=''
        spacer=','
        offsetX={-200}
        offsetY={30}

        value={this.state.current}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        disabled={this.props.disabled}
        placeholder={this.state.attendees.length ? null : 'Separated by commas'}
      />
    )

    return (
      <div className='attendeesInputContainer' id={this.state.focused ? 'focused' : 'unfocused'}>
        {this.state.attendees.map((attendee, index) => (
          <div className='attendeeBubble' onClick={this.props.disabled ? null : this.removeAttendee(attendee)} key={index} id={this.props.disabled ? 'disabled' : 'enabled'}>
            <span>{attendee}</span>

            <span className='x'>X</span>
          </div>
        ))}

        {this.input}
      </div>
    )
  }
}

AttendeesInput.propTypes = {
  attendees: () => [],
  users: () => null,
  disabled: () => null,
  onChange: () => null
}

export default AttendeesInput
