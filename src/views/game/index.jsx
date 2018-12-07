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
            this.socket.emit('start round')
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
    const tups = keys.map(k => [k, scores[k][0], scores[k][1], 2])
    for (var i = 0; i < tups.length; ++i) {
      var tup = tups[i]
      tup.push(i)
      tups[i] = tup
    }
    tups.sort((a, b) => b[1] - a[1])
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
        <h4 className="game-code">Game Code: {this.state.gameId}</h4>
        {!this.state.roundStarted ? (
          <button onClick={this.createRound} className="red shiny-button">
            Start Round
          </button>
        ) : (
          <button onClick={this.endRound} className="red shiny-button">
            End Round
          </button>
        )}
        <div className="game-data">
          <div className="players-container">
            <h3>Players</h3>
            <div>{this.renderPlayersList()}</div>
          </div>
          {this.state.rounds.length === 0 ? (
            <div>Waiting for round to start.</div>
          ) : (
            <div className="round-container">
              <h3>Round {this.state.rounds.length}</h3>
              {this.state.roundStarted ? (
                <>
                  <div style={{ marginBottom: '0.8em' }}>
                    Imitate These Emotions!
                  </div>
                  <div>{this.renderEmotionsList()}</div>
                </>
              ) : (
                <>
                  <div style={{ paddingBottom: '0.8em' }}>Rankings!</div>
                  <div className="ranking-images">
                    {this.rankedPlayers(this.state.playerScores).map((p, i) => {
                      const player = p[0]
                      const score = Number(p[1].toFixed(4))
                      const dim = `${Math.round(324 * Math.pow(0.9, i))}px`
                      return (
                        <div className="ranking-image" key={i}>
                          <img
                            style={{ width: dim, height: dim }}
                            src={`/images?id=` + p[2].filename}
                          />
                          <div>
                            {player}'S SCORE: {score}
                          </div>
                          <div className="ranking-number">{i + 1}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="confetti">
                    {(() => {
                      const confettiElems = []
                      for (let i = 0; i < 13; i++) {
                        confettiElems.push(
                          <div key={i} className="confetti-piece" />
                        )
                      }
                      return confettiElems
                    })()}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Styles>
    )
  }

  renderPlayersList() {
    const elements = []
    for (const [playerId, player] of Object.entries(this.state.players)) {
      if (player.connected) {
        elements.push(<div key={playerId}>{playerId}</div>)
      }
    }
    return elements
  }

  renderEmotionsList() {
    const { rounds } = this.state
    const { emotions_map } = rounds[rounds.length - 1]
    const elements = []
    for (const [emotion, value] of Object.entries(emotions_map)) {
      if (value > 0) {
        elements.push(
          <span className="emotion" key={emotion}>
            {emotion}
          </span>
        )
      }
    }
    return elements
  }
}

const Styles = styled.div`
  margin: auto;
  text-align: center;

  h3,
  h4 {
    margin: 0;
  }

  h3 {
    margin-bottom: 0.8em;
  }

  .title-image {
    max-width: 100%;
    max-height: 150px;
  }

  .description {
    margin: 0 auto;
    max-width: 500px;
  }

  .game-code {
    margin: 1em 0;
  }

  .game-data {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 1em auto;
    max-width: 600px;
  }

  .round-container {
    flex-grow: 1;
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

  .ranking-images {
    margin: 0 auto;
    width: fit-content;
  }

  .ranking-image {
    position: relative;
    display: block;
    background: #efefef;
    border-radius: 5px;
    padding: 0 5px 5px;
    margin-bottom: 10px;
    width: fit-content;
    cursor: pointer;
    &:hover {
      background: #fbbd06;
    }
  }

  .winner {
    width: 324px;
    height: 324px;
  }

  .runnerup {
    width: 152px;
    height: 152px;
  }

  .ranking-image img {
    object-fit: cover;
  }

  .ranking-number {
    content: counter(number);
    counter-increment: number;
    position: absolute;
    top: 7px;
    left: 7px;
    display: inline-block;
    width: 22px;
    height: 22px;
    line-height: 22px;
    color: #fff;
    background: #ea4436;
    font-size: 1.2rem;
    text-align: center;
    z-index: 1;
  }

  .confetti {
    position: absolute;
    width: 100%;
    height: 400px;
  }

  .confetti-piece {
    position: absolute;
    width: 8px;
    height: 16px;
    background: #ffd300;
    top: 0;
    opacity: 0;
  }

  .confetti-piece:nth-child(1) {
    left: 1 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(2) {
    left: 2 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(3) {
    left: 3 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(4) {
    left: 4 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(5) {
    left: 5 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(6) {
    left: 6 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(7) {
    left: 7 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(8) {
    left: 8 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(9) {
    left: 9 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(10) {
    left: 10 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(11) {
    left: 11 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(12) {
    left: 12 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(13) {
    left: 13 * 7%;
    transform: rotate((-80 + floor(random() * (161))) deg);
    animation: makeItRain 2500 * 1ms infinite ease-out;
    animation-delay: (0 + floor(random() * (1251))) ms;
    animation-duration: (2500 * 0.7 + floor(random() * (2500 * 0.5))) ms;
  }
  .confetti-piece:nth-child(odd) {
    background: #17d3ff;
  }
  .confetti-piece:nth-child(even) {
    z-index: 1;
  }

  .confetti-piece:nth-child(4n) {
    width: 5px;
    height: 12px;
    animation-duration: 2500 * 2ms;
  }

  .confetti-piece:nth-child(3n) {
    width: 3px;
    height: 10px;
    animation-duration: 2500 * 2.5ms;
    animation-delay: 2500 * 1ms;
  }

  .confetti-piece:nth-child(4n-7) {
    background: #ff4e91;
  }

  @keyframes makeItRain {
    from {
      opacity: 0;
    }

    50% {
      opacity: 1;
    }

    to {
      transform: translateY(400px);
    }
  }
`

ReactDOM.render(<Game />, document.getElementById('root'))
