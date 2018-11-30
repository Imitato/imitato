import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import LoadingPage from './LoadingPage'

class Index extends Component {
  render() {
    return <LoadingPage />
  }
}

ReactDOM.render(<Index />, document.getElementById('root'))
