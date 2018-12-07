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

  widthMap = {
    0: '324px',
    1: '324px',
    2: '324px',
    3: '324px',
    4: '324px',
    // 1: "150px",
    // 2: "150px",
    // 3: "150px",
    // 4: "150px"
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
          <div>
            <h3>Players</h3>
            <div>{this.renderPlayersList()}</div>
          </div>
          {this.state.rounds.length === 0 ? (
            <div>Waiting for round to start.</div>
          ) : (
            <div>
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
                  <div>Rankings!</div>
                  <div className="confetti">
                    {(() => {
                      const confettiElems = []
                      for (let i = 0; i < 13; i++) {
                        confettiElems.push(<div className="confetti-piece" />)
                      }
                      return confettiElems
                    })()}
                    <div id="ranking-slide">
                      <ol>
                        {this.rankedPlayers(this.state.playerScores).map(p => (
                          <div>
                            <li>
                              <a href="">
                                <img
                                  src={`/images?id=` + p[2].filename}
                                  className="small-rank"
                                  width={this.widthMap[p[4]]}
                                  height={this.widthMap[p[4]]}
                                  align="center"
                                />{' '}
                              </a>
                            </li>
                          </div>
                        ))}
                      </ol>
                    </div>
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
  }

  .game-code {
    margin: 1em 0;
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

  .confetti {
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

  body {
    background: #ccc;
  }

  #ranking-slide {
    position: relative;
    width: 692px;
    height: 338px;
    margin: 30px auto;
  }

  #ranking-slide > :not(a) {
    overflow: hidden;
    white-space: nowrap;
  }

  #ranking-slide > a {
    cursor: pointer;
  }

  #ranking-slide li {
    display: inline-block;
    margin: 0 16px 0 0;
  }

  #ranking-slide li,
  #ranking-slide li > a {
    width: 162px;
    height: 162px;
  }

  #ranking-slide li > a {
    cursor: pointer;
    display: block;
    background: #efefef;
    border-radius: 5px;
  }

  #ranking-slide li > a:hover {
    background: #fbbd06;
  }

  #ranking-slide li:nth-child(n + 2):nth-child(-n + 3) {
    top: -172px;
  }

  #ranking-slide li:nth-child(4) {
    margin: 175px 16px 0 -356px;
  }

  #ranking-slide li:first-child,
  #ranking-slide li:first-child > a {
    width: 336px;
    height: 335px;
  }

  #ranking-slide {
    counter-reset: number;
  }

  #ranking-slide li {
    position: relative;
  }

  #ranking-slide li:before {
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

  #ranking-slide li:first-child:before {
    width: 25px;
    height: 25px;
    line-height: 25px;
    font-size: 1.5rem;
  }
  #big-rank {
    width: 324px;
    height: 324px;
    text-align: center;
    margin: 6px 6px;
  }
  .small-rank {
    object-fit: cover;
  }
`

ReactDOM.render(<Game />, document.getElementById('root'))
