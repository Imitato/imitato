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
        <div className="container">
          <img className="title-image" src="images/imitato.png" />
          <h2>Imitato Game Master</h2>
          <p>
            Play a game of Imitato, a fun game where you make faces with your
            friends and have the computer guess your emotion.
          </p>

          <div>
            <button
              id="createGameButton"
              onClick={this.createGame}
              className="yellow shiny-button"
            >
              Create game
            </button>
            <br />
            <h4 id="gameIdBox">GAME ID: {this.state.gameId}</h4>
            {this.state.roundState === 0 ? (
              <button
                id="getGameButton"
                onClick={this.createRound}
                className="red shiny-button"
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
                className="red shiny-button"
              >
                End Round
              </button>
            ) : (
              <></>
            )}
          </div>
          <br></br>
          {this.state.rounds && this.state.rounds.length ? (
            <>
              <div>Round {this.state.rounds.length}</div>
              {this.state.roundState === 0 ? <div>Rankings!</div> : <></>}
              {this.state.roundState === 1 ? (
                <div>Imitate These Emotions!</div>
              ) : (
                <></>
              )}
              {this.state.roundState === 1 &&
                Object.keys(
                  this.state.rounds[this.state.rounds.length - 1].emotions_map
                ).map(emotion =>
                  this.state.rounds[this.state.rounds.length - 1]
                    .emotions_map[emotion] > 0 ? (
                    <div>{emotion}<br></br></div>
                  ) : (
                    <></>
                  )
                )}
              {this.state.roundState === 0 &&
                this.rankedPlayers(this.state.playerScores).map(p => (
                  <div>
                    {p[0]} {p[1]} <img src={'/images?id=' + p[2].filename} />
                  
                  
                  <div class="confetti">
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>
                  <div class="confetti-piece"></div>

                  <div id="ranking-slide">
                    <ol>
                      <li><a href=""><img src="https://i.ytimg.com/vi/ilXuh_-68N8/maxresdefault.jpg" width="324px" height="324px" align="middle" style="margin:6px 6px"/></a></li><li>
                      <a href=""><img src="https://multifiles.pressherald.com/uploads/sites/2/2014/07/310825_167737-Climber3.jpg" width="150px" height="150px" align="middle" style="margin:6px 6px"/></a></li><li>
                      <a href=""><img src="https://docplayer.net/docs-images/56/39347667/images/39-0.png" width="150px" height="150px" align="middle" style="margin:6px 6px"/></a></li><li>
                      <a href=""><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWD8bozdI2f9hKrFwJPL2KEwmGvP-yNXwDmYhEC8byXkEMMp_I" width="150px" height="150px" align="middle" style="margin:6px 6px"/></a></li><li>
                      <a href=""><img src="https://s-media-cache-ak0.pinimg.com/236x/27/bc/62/27bc620d34592e5d694b0327f173a87f--navy-dress-the-dress.jpg" width="150px" height="150px" align="middle" style="margin:6px 6px"/></a></li>
                    </ol>
                  </div>
                </div>
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
  .container {
    max-width: 838px;
    margin: auto;
    text-align: center;
  }
  .title-image {
    max-width: 500px;
    width: 100%;
  }
  .shiny-button {
    font-family: 'Montserrat', sans-serif;
    font-weight: 300;
    text-decoration: none;
    padding: 14px;
    border-radius: 48px;

    position: relative;
    text-align: center;
    transition: background-color 0.15s ease-in-out;
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

  $yellow: #ffd300;
  $blue: #17d3ff;
  $pink: #ff4e91;

  $duration: 2500;

  @function randomNum($min, $max) {
    $rand: random();
    $randomNum: $min + floor($rand * (($max - $min) + 1));

    @return $randomNum;
  }

  .confetti {
    width: 100%;
    height: 400px;
  }

  .confetti-piece {
    position: absolute;
    width: 8px;
    height: 16px;
    background: $yellow;
    top: 0;
    opacity: 0;
    
    @for $i from 1 through 13 {
      &:nth-child(#{$i}) {
        left: $i * 7%;
        transform: rotate(#{randomNum(-80, 80)}deg);
        animation: makeItRain $duration * 1ms infinite ease-out;
        animation-delay: #{randomNum(0, $duration * .5)}ms;
        animation-duration: #{randomNum($duration * .7, $duration * 1.2)}ms
      }
    }
    
    &:nth-child(odd) {
      background: $blue;
    }
    
    &:nth-child(even) {
      z-index: 1;
    }
    
    &:nth-child(4n) {
      width: 5px;
      height: 12px;
      animation-duration: $duration * 2ms;
    }
    
    &:nth-child(3n) {
      width: 3px;
      height: 10px;
      animation-duration: $duration * 2.5ms;
      animation-delay: $duration * 1ms;
    }
    
    &:nth-child(4n-7) {
      background: $pink;
    }
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

  body{
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
    background: #FBBD06;
  }

  #ranking-slide li:nth-child(n+2):nth-child(-n+3) {
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

  #ranking-slide  {
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
    background: #EA4436;
    font-size: 1.2rem;
    text-align: center;
    z-index: 1;
  }

  #ranking-slide  li:first-child:before {
    width: 25px;
    height: 25px;
    line-height: 25px;
    font-size: 1.5rem;
  }
  `

ReactDOM.render(<Game />, document.getElementById('root'))
