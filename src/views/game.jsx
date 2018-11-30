import React, { Component } from 'react'
import ReactDOM from 'react-dom'

class Game extends Component {
  constructor(props) {
    super(props)
    this.state = {
      game_id: '',
      rounds: [],
      roundState: -1,
      playerScores: {}
    }
  }

  endRound = () => {
    var gameId = this.state.game_id
    var data = new FormData();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState === 4) {
          const rounds = JSON.parse(xhr.response).value.rounds
          const submissions = rounds[rounds.length - 1].submissions
          let curr = Object.assign({}, this.state.playerScores)
          submissions.forEach(sub => {
            if (sub.userId in curr) {
              curr[sub.userId] += sub.score
            } else {
              curr[sub.userId] = sub.score
            }
          })
          this.setState({roundState: 0, playerScores: curr})
        }
    });

    xhr.open("GET", "/imitato/game/end_round?gameId=" + gameId);
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
  }

  createRound = () => {
    var gameId = this.state.game_id
    var data = new FormData();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState === 4) {
          this.setState({rounds: JSON.parse(xhr.response).rounds, roundState: 1})
          let xhr2 = new XMLHttpRequest()
          xhr2.withCredentials = true;

          xhr2.open("GET", "/imitato/game/start_round?gameId=" + gameId);
          xhr2.setRequestHeader("cache-control", "no-cache");

          xhr2.send(data);
        }
    });

    xhr.open("GET", "/imitato/game/create_round?gameId=" + gameId);
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
  }

  createGame = () => {
    var gameId = this.state.game_id
    var data = new FormData();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState === 4) {
            this.setState({game_id: JSON.parse(xhr.response)._id, roundState: 0})
        }
    });

    xhr.open("GET", "/imitato/game/create");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
  }

  rankedPlayers = scores => {
    const keys = Object.keys(scores)
    console.log(scores)
    let tups = keys.map(k => [k, scores[k]])
    console.log(tups)
    tups.sort((a,b) => {
      return b[1] - a[1]
    })
    console.log(tups)
    return tups
  }

  render() {
    return (
      <>
        <img src="images/imitato.png"/>
          <h2>Imitato Gamemaster</h2>
          <p>Set up a game of Imitato, a fun game where you imitate ideas with your friends and have the computer guess.</p>

          <div>
              <button id="createGameButton" onClick={this.createGame}>Create game</button><br />
              <h4 id="gameIdBox">GAME ID: {this.state.game_id}</h4>
              {this.state.roundState === 0 ? (<button id="getGameButton" onClick={this.createRound}>Start Round</button>) : (<></>)}
              {this.state.roundState === 1 ? (<button id="endGameButton" onClick={this.endRound}>End Round</button>) : (<></>)}
          </div>
          {this.state.rounds && this.state.rounds.length ? (
            <>
              <div>Round {this.state.rounds.length}</div>
              {this.state.roundState === 0 ? (<div>Rankings!</div>) : (<></>)}
              {this.state.roundState === 1 ? (<div>Imitate These Emotions!</div>) : (<></>)}
              <ul>
                {this.state.roundState === 1 && Object.keys(this.state.rounds[this.state.rounds.length - 1].emotions_map).map(emotion => (
                  this.state.rounds[this.state.rounds.length - 1].emotions_map[emotion] > 0 ? (
                    <li>{emotion}</li>
                  ) : (
                    <></>
                  )
                ))}
                {this.state.roundState === 0 && this.rankedPlayers(this.state.playerScores).map(p => (
                  <div>{p[0]}</div>
                ))}
              </ul>
            </>
          ) : (
            <></>
          )}
      </>
    )
  }
}

ReactDOM.render(<Game />, document.getElementById('root'))
