import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import axios from 'axios'
import io from 'socket.io-client'

class Game extends Component {
  state = {
    gameId: '',
    rounds: [],
    roundStarted: false,
    playerScores: {},
    players: [],
  }

  pictures = {
    Alan: '',
  }

  getPicture = key => {
    if (key in this.pictures) {
      return this.pictures[key]
    } else {
      return ''
    }
  }

  createRound = () => {
    const { gameId } = this.state
    const query = { params: { gameId } }
    axios
      .get('/imitato/game/create_round', query)
      .then(response => {
        const { rounds } = response.data
        this.setState({ rounds })
        axios
          .get('/imitato/game/start_round', query)
          .then(response => {
            this.setState({ roundStarted: true })
          })
          .catch(error => console.error(error))
      })
      .catch(error => console.error(error))
  }

  endRound = () => {
    const { gameId } = this.state
    const query = { params: { gameId } }
    axios
      .get('/imitato/game/end_round', query)
      .then(response => {
        const data = response.data.value
        const { rounds } = data
        const submissions = rounds[rounds.length - 1].submissions
        const scores = Object.assign({}, this.state.playerScores)
        submissions.forEach(sub => {
          const { playerId } = sub
          if (playerId in scores) {
            old_score = scores[playerId][0]
            old_image = scores[playerId][1]

            scores[playerId] = [sub.score + old_score, sub.image]
          } else {
            scores[playerId] = [sub.score, sub.image]
          }
        })
        this.setState({ roundStarted: false, playerScores: scores })
      })
      .catch(error => console.log(error))
  }

  rankedPlayers = scores => {
    const keys = Object.keys(scores)
    console.log(scores)
    let tups = keys.map(k => [k, scores[k][0], scores[k][1]])
    console.log(tups)
    tups.sort((a, b) => {
      return b[1] - a[1]
    })
    console.log(tups)
    return tups
  }

  componentDidMount() {
    // create game
    axios
      .get('/imitato/game/create')
      .then(response => {
        const gameId = response.data._id
        this.socket = io({ query: { role: 'gamemaster', gameId } })
        this.socket.on('connect', () => this.setState({ gameId }))
        this.socket.on('players', players => this.setState({ players }))
      })
      .catch(error => console.error(error))
  }

  render() {
    return (
      <Styles>
        <img className="title-image" src="images/imitato.png" />
        <p className="description">
          Play a game of Imitato, a fun game where you make faces with your
          friends to see who can match the emotions the best.
        </p>
        <div className="game-data">
          <div>
            <h4 id="gameIdBox">Game Code: {this.state.gameId}</h4>
          </div>
          <div>
            <h4>Players</h4>
            <div>{this.renderPlayersList()}</div>
          </div>
        </div>
        {!this.state.roundStarted ? (
          <button onClick={this.createRound} className="red shiny-button">
            Start Round
          </button>
        ) : (
          <button onClick={this.endRound} className="red shiny-button">
            End Round
          </button>
        )}
        {this.state.rounds && this.state.rounds.length ? (
          <>
            <h3>Round {this.state.rounds.length}</h3>
            {this.state.roundStarted && (
              <>
                <div style={{ marginBottom: '0.8em' }}>
                  Imitate These Emotions!
                </div>
                <div>{this.renderEmotionsList()}</div>
              </>
            )}
            {!this.state.roundStarted ? <div>Rankings!</div> : <></>}
            {!this.state.roundStarted &&
              this.rankedPlayers(this.state.playerScores).map(p => (
                <div>
                  {p[0]} {p[1]} <img src={'/images?id=' + p[2].filename} />
                </div>
              ))}
          </>
        ) : null}
      </Styles>
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

  renderEmotionsList() {
    const { rounds } = this.state
    const { emotions_map } = rounds[rounds.length - 1]
    const emotionElems = []
    for (const [emotion, value] of Object.entries(emotions_map)) {
      if (value > 0) {
        emotionElems.push(
          <span className="emotion" key={emotion}>
            {emotion}
          </span>
        )
      }
    }
    return emotionElems
  }
}

const Styles = styled.div`
  max-width: 500px;
  margin: auto;
  text-align: center;
  h4 {
    margin: 0;
  }
  .title-image {
    width: 100%;
  }
  .description {
    margin: 0 auto;
  }
  .game-data {
    display: flex;
    justify-content: center;
    margin: 1em auto;
    > div {
      flex-grow: 1;
      flex-basis: 0;
    }
  }
  .shiny-button {
    padding: 0.6em 1.8em;
    border-radius: 48px;
    font-weight: 600;
    text-align: center;
    transition: background-color 0.15s ease-in-out;
    cursor: pointer;
  }
  .red {
    color: #fbbd06;
    border: 3px solid #ea4436;
    background-color: #ea5034;
    &:hover {
      background-color: #ea4436;
    }
  }
  .yellow {
    color: #ea4436;
    border: 3px solid #fbbd06;
    background-color: #fbce05;
    &:hover {
      background-color: #fbbd06;
    }
  }

  .emotion {
    display: inline-block;
    margin: 0 0.3em 0.4em;
    padding: 0.2em 0.6em;
    background-color: #3f51b5;
    color: white;
    font-size: 20px;
  }

  i {
    position: absolute;
    opacity: 0;
    top: 0;
    left: 0;

    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.03) 1%,
      rgba(255, 255, 255, 0.6) 30%,
      rgba(255, 255, 255, 0.85) 50%,
      rgba(255, 255, 255, 0.85) 70%,
      rgba(255, 255, 255, 0.85) 71%,
      rgba(255, 255, 255, 0) 100%
    ); /* W3C */

    width: 15%;
    height: 100%;
    transform: skew(-10deg, 0deg);
    animation: move 2s;
    animation-iteration-count: infinite;
    animation-delay: 1s;
  }
  @keyframes move {
    0% {
      left: 0;
      opacity: 0;
    }
    5% {
      opacity: 0;
    }
    48% {
      opacity: 0.2;
    }
    80% {
      opacity: 0;
    }
    100% {
      left: 82%;
    }
  }
`

ReactDOM.render(<Game />, document.getElementById('root'))
