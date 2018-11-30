import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import LoadingPage from './LoadingPage'

class App extends Component {
  render() {
    return <LoadingPage />
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
