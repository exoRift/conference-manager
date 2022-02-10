import React from 'react'
import Markdown from 'react-markdown'

import postFetch from './util/postFetch.js'
import background from '../assets/images/building.jpg'
import about from '../assets/about.md'

import './styles/Home.css'

function Post (props) {
  return (
    <div className='post'>
      <div className='header'>
        <div className='title'>{props.data.title}</div>

        <div className='timestamp'>{new Date(props.data.timestamp).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}</div>
      </div>

      <div className='content'>
        <Markdown>
          {props.data.content}
        </Markdown>
      </div>

      <div className='footer'>
        {props.data.creator}
      </div>
    </div>
  )
}

class Home extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      posts: [],
      about: '',
      expanded: false
    }

    this.expand = this.expand.bind(this)
  }

  componentDidMount () {
    fetch(about)
      .then(postFetch)
      .then((about) => about.text())
      .then((about) => this.setState({ about }))
      .catch(this.props.onError)

    if ('auth' in localStorage) {
      fetch('/api/post/list/20', {
        method: 'GET',
        headers: {
          Authorization: localStorage.auth
        }
      })
        .then(postFetch)
        .then((posts) => posts.json())
        .then((posts) => Promise.all(posts.map((p) => fetch(`/api/user/${p.creator}/name`, {
          method: 'GET'
        })
          .then(postFetch)
          .then((creator) => creator.json())
          .then((creator) => {
            return {
              ...p,
              creator: `${creator.firstname} ${creator.lastname}`
            }
          }))))
        .then((posts) => this.setState({ posts }))
        .catch(this.props.onError)
    }
  }

  render () {
    return (
      <div className='app-container home' style={{ backgroundImage: `url(${background})` }}>
        <div className='home-container'>
          <div className='about'>
            <Markdown>{this.state.about}</Markdown>
          </div>

          {'auth' in localStorage
            ? (
              <div className={`post-container ${this.state.expanded ? '' : 'retracted'}`} onClick={this.state.expanded ? undefined : this.expand}>
                <strong className='header'>Building Announcements</strong>

                <div className='posts'>
                  {this.state.posts.map((p, i) => <Post key={i} data={p}/>)}
                </div>
              </div>
              )
            : null}
        </div>
      </div>
    )
  }

  expand () {
    this.setState({
      expanded: true
    })
  }
}

export default Home
