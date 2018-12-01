import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import SetupScreen from './SetupScreen'
import PhotoScreen from './PhotoScreen'

class Player extends Component {
  state = { state: 'setup' }

  render() {
    return (
      <>
        {this.state.state == 'setup' && (
          <SetupScreen onJoin={() => this.setState({ state: 'photo' })} />
        )}
        {this.state.state == 'photo' && <PhotoScreen />}
      </>
    )
  }
}

ReactDOM.render(<Player />, document.getElementById('root'))
