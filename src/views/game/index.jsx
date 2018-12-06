import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import axios from 'axios'

class Game extends Component {
  state = {
    gameId: '',
    rounds: [],
    roundState: -1,
    playerScores: {},
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
        this.setState({ roundState: 0, playerScores: curr })
      })
      .catch(error => console.log(error))
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
            this.setState({ roundState: 1 })
          })
          .catch(error => console.error(error))
      })
      .catch(error => console.error(error))
  }

  createGame = () => {
    axios.get('/imitato/game/create').then(response => {
      const gameId = response.data._id
      this.setState({ gameId, roundState: 0 })
    })
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

  render() {
    return (
      <Styles>
        <div className="content">
          <img
            style={{
              maxWidth: '500px',
              width: '100%',
            }}
            src="images/imitato.png"
          />
          <h2>Imitato Game Master</h2>
          <p>
            Play a game of Imitato, a fun game where you make faces with your
            friends and have the computer guess your emotion.
          </p>

          <div>
            <button
              id="createGameButton"
              onClick={this.createGame}
              className="yellow shiny_button"
            >
              Create game
            </button>
            <br />
            <h4 id="gameIdBox">GAME ID: {this.state.gameId}</h4>
            {this.state.roundState === 0 ? (
              <button
                id="getGameButton"
                onClick={this.createRound}
                className="red shiny_button"
              >
                Start Round
              </button>
            ) : (
              <></>
            )}
            {this.state.roundState === 1 ? (
              <button
                id="endGameButton"
                onClick={this.endRound}
                className="red shiny_button"
              >
                End Round
              </button>
            ) : (
              <></>
            )}
          </div>
          {this.state.rounds && this.state.rounds.length ? (
            <>
              <div>Round {this.state.rounds.length}</div>
              {this.state.roundState === 0 ? <div>Rankings!</div> : <></>}
              {this.state.roundState === 1 ? (
                <div>Imitate These Emotions!</div>
              ) : (
                <></>
              )}
              <ul>
                {this.state.roundState === 1 &&
                  Object.keys(
                    this.state.rounds[this.state.rounds.length - 1].emotions_map
                  ).map(emotion =>
                    this.state.rounds[this.state.rounds.length - 1]
                      .emotions_map[emotion] > 0 ? (
                      <li>{emotion}</li>
                    ) : (
                      <></>
                    )
                  )}
              </ul>
              {this.state.roundState === 0 &&
                this.rankedPlayers(this.state.playerScores).map(p => (
                  <div>
                    {p[0]} {p[1]} <img src={'/images?id=' + p[2].filename} />
                  </div>
                ))}
            </>
          ) : (
            <></>
          )}
        </div>
      </Styles>
    )
  }
}

const Styles = styled.div`
  @mixin fade-transition($element) {
    -webkit-transition: $element 0.15s ease-in-out;
    -moz-transition: $element 0.15s ease-in-out;
    -ms-transition: $element 0.15s ease-in-out;
    -o-transition: $element 0.15s ease-in-out;
    transition: $element 0.15s ease-in-out;
  }
  .red {
    color: #fbbd06;
    border: 3px solid #ea4436;
    background: #ea5034;
    &:hover {
      background: #ea4436;
    }
  }
  .yellow {
    color: #ea4436;
    border: 3px solid #fbbd06;
    background: #fbce05;
    &:hover {
      background: #fbbd06;
    }
  }
  .content {
    max-width: 838px;
    margin: auto;
    text-align: center;
  }
  * {
    font-family: 'Montserrat', sans-serif;
  }
  .shiny_button {
    font-family: 'Montserrat', sans-serif;
    font-weight: 300;
    text-decoration: none;
    padding: 14px;
    border-radius: 48px;

    position: relative;
    text-align: center;
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -o-transform: translate(-50%, -50%);
    @include fade-transition(background);
  }
  i {
    position: absolute;
    opacity: 0;
    top: 0;
    left: 0;

    background: -moz-linear-gradient(
      left,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.03) 1%,
      rgba(255, 255, 255, 0.6) 30%,
      rgba(255, 255, 255, 0.85) 50%,
      rgba(255, 255, 255, 0.85) 70%,
      rgba(255, 255, 255, 0.85) 71%,
      rgba(255, 255, 255, 0) 100%
    ); /* FF3.6+ */
    background: -webkit-gradient(
      linear,
      left top,
      right top,
      color-stop(0%, rgba(255, 255, 255, 0)),
      color-stop(1%, rgba(255, 255, 255, 0.03)),
      color-stop(30%, rgba(255, 255, 255, 0.85)),
      color-stop(50%, rgba(255, 255, 255, 0.85)),
      color-stop(70%, rgba(255, 255, 255, 0.85)),
      color-stop(71%, rgba(255, 255, 255, 0.85)),
      color-stop(100%, rgba(255, 255, 255, 0))
    ); /* Chrome,Safari4+ */
    background: -webkit-linear-gradient(
      left,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.03) 1%,
      rgba(255, 255, 255, 0.6) 30%,
      rgba(255, 255, 255, 0.85) 50%,
      rgba(255, 255, 255, 0.85) 70%,
      rgba(255, 255, 255, 0.85) 71%,
      rgba(255, 255, 255, 0) 100%
    ); /* Chrome10+,Safari5.1+ */
    background: -o-linear-gradient(
      left,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.03) 1%,
      rgba(255, 255, 255, 0.6) 30%,
      rgba(255, 255, 255, 0.85) 50%,
      rgba(255, 255, 255, 0.85) 70%,
      rgba(255, 255, 255, 0.85) 71%,
      rgba(255, 255, 255, 0) 100%
    ); /* Opera 11.10+ */
    background: -ms-linear-gradient(
      left,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.03) 1%,
      rgba(255, 255, 255, 0.6) 30%,
      rgba(255, 255, 255, 0.85) 50%,
      rgba(255, 255, 255, 0.85) 70%,
      rgba(255, 255, 255, 0.85) 71%,
      rgba(255, 255, 255, 0) 100%
    ); /* IE10+ */
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
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00ffffff', endColorstr='#00ffffff',GradientType=1 ); /* IE6-9 */

    width: 15%;
    height: 100%;
    transform: skew(-10deg, 0deg);
    -webkit-transform: skew(-10deg, 0deg);
    -moz-transform: skew(-10deg, 0deg);
    -ms-transform: skew(-10deg, 0deg);
    -o-transform: skew(-10deg, 0deg);

    animation: move 2s;
    animation-iteration-count: infinite;
    animation-delay: 1s;
    -webkit-animation: move 2s;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-delay: 1s;
    -moz-transform: skew(-10deg, 0deg);
    -moz-animation: move 2s;
    -moz-animation-iteration-count: infinite;
    -moz-animation-delay: 1s;
    -ms-transform: skew(-10deg, 0deg);
    -ms-animation: move 2s;
    -ms-animation-iteration-count: infinite;
    -ms-animation-delay: 1s;
    -o-transform: skew(-10deg, 0deg);
    -o-animation: move 2s;
    -o-animation-iteration-count: infinite;
    -o-animation-delay: 1s;
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
  @-webkit-keyframes move {
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
  @-moz-keyframes move {
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
      left: 88%;
    }
  }
  @-ms-keyframes move {
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
  @-o-keyframes move {
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
