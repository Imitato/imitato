import React, { Component } from 'react'
import ReactDOM from 'react-dom'

class Game extends Component {
  constructor(props) {
    super(props)
    this.state = {
      game_id: '',
      rounds: []
    }
  }

  createRound = () => {
    var gameId = this.state.game_id
    var data = new FormData();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", () => {
        if (xhr.readyState === 4) {
          this.setState({rounds: JSON.parse(xhr.response).rounds})
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
            this.setState({game_id: JSON.parse(xhr.response)._id})
        }
    });

    xhr.open("GET", "/imitato/game/create");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
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
              <button id="getGameButton" onClick={this.createRound}>Start Round</button>
          </div>
          {this.state.rounds && this.state.rounds.length ? (
            <>
              <div>Round {this.state.rounds.length}</div>
              <ul>
                {Object.keys(this.state.rounds[this.state.rounds.length - 1].emotions_map).map(emotion => (
                  this.state.rounds[this.state.rounds.length - 1].emotions_map[emotion] > 0 ? (
                    <li>{emotion}</li>
                  ) : (
                    <></>
                  )
                ))}
              </ul>
              {    Object.keys(this.state.rounds[this.state.rounds.length - 1].emotions_map).map(emotion => {
            console.log(emotion)
            console.log(this.state.rounds[this.state.rounds.length - 1].emotions_map[emotion] > 0)
          })}
            </>
          ) : (
            <></>
          )}
      </>
    )
  }
}

ReactDOM.render(<Game />, document.getElementById('root'))
