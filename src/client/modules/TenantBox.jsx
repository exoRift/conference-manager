import React from 'react'

import postFetch from '../util/postFetch.js'

import '../styles/TenantBox.css'

class Tenant extends React.Component {
  static defaultProps = {
    blank: false,
    invalid: {}
  }

  static maxLengths = {
    name: 50,
    suite: 4
  }

  constructor (props) {
    super(props)

    this.state = {
      tenant: props.data || {},
      alter: {},
      invalid: {},
      editing: props.blank,
      success: false,
      lockSave: false
    }
  }

  componentDidMount () {
    if (!this.props.blank && !this.props.data) {
      return fetch(`/api/tenant/${this.props.id}/all`, {
        method: 'GET',
        headers: {
          Authorization: localStorage.auth
        }
      })
        .then(postFetch)
        .then((tenant) => tenant.json())
        .then((tenant) => {
          this.setState({ tenant })

          this.props.onInfo?.(tenant)
        })
        .catch(this.props.onError)
    }
  }

  render () {
    return (
      <form className='tenantbox' onSubmit={this.submit.bind(this)}>
        {this.props.header
          ? <span className='header'>{this.props.header}</span>
          : null}

        <div className='form-group'>
          <label htmlFor={'nameTBInput'}>Name</label>

          <input
            className={`form-control${this.state.success || this.props.success
              ? ' is-valid'
              : ''}${this.state.invalid.name
                ? ' is-invalid'
                : ''}`}
            id='nameTBInput'
            placeholder={this.state.tenant.name || ''}
            disabled={!this.state.editing || this.props.locked?.includes('name')}
            value={this.state.alter.name || ''}
            maxLength={Tenant.maxLengths.name}
            onChange={this.onChange.bind(this, 'name')}
          />
        </div>
        <div className='form-group'>
          <label htmlFor={'suiteTBInput'}>Suite</label>

          <input className={`form-control${this.state.success || this.props.success
              ? ' is-valid'
              : ''}${this.state.invalid.tenant
                ? ' is-invalid'
                : ''}`}
            id='suiteTBInput'
            placeholder={this.state.tenant.suite || ''}
            disabled={!this.state.editing || this.props.locked?.includes('suite')}
            value={this.state.alter.suite || ''}
            maxLength={Tenant.maxLengths.suite}
            onChange={this.onChange.bind(this, 'suite')}
          />
        </div>

        {this.props.blank
          ? null
          : this.state.editing
            ? (
              <div className='editing-button-container'>
                <button type='submit' className='btn btn-primary btn-success' disabled={this.state.lockSave || this.props.lockSave}>Save Changes</button>
                <button type='button' className='btn btn-danger btn-cancel' onClick={() => this.setState({ editing: false, alter: {} })}>Cancel</button>
              </div>
              )
            : <button type='button' className='btn btn-primary' onClick={() => this.setState({ editing: true })}>Edit</button>}

          {this.props.children}
      </form>
    )
  }

  onChange (field, event) {
    const altered = {
      ...this.state.alter,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    }

    if (event.target.type !== 'checkbox' && !event.target.value.length) delete altered[field]

    this.props.onChange?.(altered)

    this.setState({
      alter: altered
    })
  }

  submit (event) {
    event.preventDefault()

    if (Object.keys(this.state.alter).length) {
      this.setState({
        lockSave: true
      })

      fetch('/api/tenant/' + this.props.id, {
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
            editing: false,
            success: true
          })

          this.props.onSuccess?.()
        })
        .catch(this.props.onError)
        .finally(() => this.setState({ lockSave: false }))
    } else {
      this.setState({
        editing: false
      })
    }
  }
}

export default Tenant
