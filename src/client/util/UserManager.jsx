import React from 'react'

const {
  REACT_APP_API_URL
} = process.env

class UserManager extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      users: [],
      final: [],
      editing: [],
      saved: false,
      error: null
    }

    this.onChange = this.onChange.bind(this)
    this.onToggle = this.onToggle.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount () {
    fetch(REACT_APP_API_URL + '/user/all/defining', {
      headers: {
        Authorization: localStorage.getItem('auth'),
        Accept: 'application/json'
      }
    }).then((data) => {
      if (data.ok) {
        data.json().then((users) => this.setState({
          users
        }))
      }
    })
  }

  onChange (id) {
    return (event) => {
      const index = this.state.users.findIndex((u) => u.id === id)

      const changes = this.state.users

      changes[index][event.target.id] = event.target.type === 'checkbox' ? event.target.checked : event.target.value

      this.setState({
        users: changes
      })
    }
  }

  onToggle (event) {
    if (this.state.editing.includes(event.target.id)) {
      const changes = this.state.final
      const user = this.state.users.find((u) => u.id === event.target.id)
      const index = changes.findIndex((u) => u.id === user.id)

      if (index === -1) changes.push(user)
      else changes[index] = user

      this.setState({
        final: changes
      })
    }

    const changes = this.state.editing

    const index = this.state.editing.findIndex((u) => u === event.target.id)

    if (index === -1) changes.push(event.target.id)
    else changes.splice(index, 1)

    this.setState({
      editing: changes
    })
  }

  onSubmit () {
    const promises = []

    for (const user of this.state.final) {
      for (const param in user) {
        if (param !== 'pass' && typeof user[param] === 'string' && !user[param].length) {
          return this.setState({
            saved: true,
            error: 'Parameter cannot be empty: ' + param.substring(0, 1).toUpperCase() + param.substring(1)
          })
        }
      }
    }

    for (const user of this.state.final) {
      promises.push(fetch(`${REACT_APP_API_URL}/user/${user.id}/update`, {
        method: 'POST',
        headers: {
          Authorization: localStorage.getItem('auth'),
          Accept: 'text/plain',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      }))
    }

    Promise.all(promises).then((responses) => {
      this.setState({
        error: null,
        saved: true
      })

      for (const data of responses) {
        if (!data.ok) {
          data.text().then((error) => this.setState({
            error
          }))

          break
        }
      }

      setTimeout(() => this.setState({
        saved: false
      }), 2000)
    })
  }

  render () {
    return (
      <div className='users'>
        <div className='headers'>
          <h3>Name</h3>
          <h3>Email</h3>
          <h3>Password</h3>
        </div>

        <div className='userContainer'>
          {this.state.users.map((u) => {
            const onChange = this.onChange(u.id)

            return (
              <div className='objectContainer' key={u.id}>
                <input value={u.name} onChange={onChange} id='name' disabled={!this.state.editing.includes(u.id)}/>
                <input type='email' value={u.email} onChange={onChange} id='email' disabled={!this.state.editing.includes(u.id)}/>
                <input placeholder='SET A NEW PASSWORD' value={u.pass || ''} onChange={onChange} id='pass' disabled={!this.state.editing.includes(u.id)}/>
                <input type='checkbox' checked={JSON.parse(u.admin)} onChange={onChange} id='admin' disabled={!this.state.editing.includes(u.id)} data-toggle='tooltip' title='Give user admin status'/>

                <button type='button' onClick={this.onToggle} id={u.id}>{this.state.editing.includes(u.id) ? '\u2714' : '\u270E'}</button>
              </div>
            )
          })}
        </div>

        {this.state.saved
          ? this.state.error
            ? (
              <div className='adminErrorContainer'>
                <h6 className='error'>{this.state.error}</h6>
              </div>
            )
            : (
              <h4 className='adminSavedNotif'>Changes saved!</h4>
            )
          : null}
      </div>
    )
  }
}

export default UserManager
