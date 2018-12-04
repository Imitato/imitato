import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import io from 'socket.io-client'

class Game extends Component {
  state = {
    gameId: '',
    rounds: [],
    roundState: -1,
    playerScores: {},
    players: [],
  }

  createGame = () => {
    axios.get('/imitato/game/create').then(res => {
      const gameId = res.data
      if (this.socket) {
        this.socket.disconnect()
      }
      this.socket = io({ query: { role: 'gamemaster', gameId } })
      this.socket.on('connect', () => {
        console.log('connected')
        this.setState({ gameId })
      })
      this.socket.on('players', players => {
        console.log(players)
        this.setState({ players })
      })
    })
  }

  startRound = () => {
    this.socket.emit('start round')
  }

  render() {
    return (
      <>
        <img style={{ width: '400px' }} src="images/imitato.png" />
        <h2>Imitato Gamemaster</h2>
        <p>
          Set up a game of Imitato, a fun game where you imitate ideas with your
          friends and have the computer guess.
        </p>

        <div>
          <button onClick={this.createGame}>Start Game</button>
          <br />
          <h4>GAME ID: {this.state.gameId}</h4>
          <button onClick={this.startRound}>Start Round</button>
        </div>
        <div>
          <h4>Players</h4>
          {this.renderPlayersList()}
        </div>
      </>
    )
  }

  renderPlayersList() {
    const playerElems = []
    for (const [playerId, player] of Object.entries(this.state.players)) {
      if (player.connected) {
        playerElems.push(<div key={playerId}>{playerId}</div>)
      }
    }
    return playerElems
  }
}

ReactDOM.render(<Game />, document.getElementById('root'))
