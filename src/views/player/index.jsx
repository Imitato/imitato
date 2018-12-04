import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import SetupScreen from './SetupScreen'
import PhotoScreen from './PhotoScreen'

class Player extends Component {
  state = { state: 'setup' }

  render() {
    return (
      <>
        {this.state.state == 'setup' && <SetupScreen onJoin={this._onJoin} />}
        {this.state.state == 'photo' && <PhotoScreen />}
      </>
    )
  }

  _onJoin = options => {
    this.setState({ state: 'photo' })
  }
}

ReactDOM.render(<Player />, document.getElementById('root'))
