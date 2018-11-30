import React, { Component } from 'react'
import ReactDOM from 'react-dom'

class Game extends Component {
  constructor(props) {
    super(props)
    this.state = {
      game_id: ''
    }
  }

  getGame = () => {
    var gameId = this.state.game_id
    var data = new FormData();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
        console.log(this.responseText);
        }
    });

    xhr.open("GET", "/imitato/game?id=" + gameId);
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
        <img src="../imitato.png"/>
          <h2>Imitato Gamemaster</h2>
          <p>Set up a game of Imitato, a fun game where you imitate ideas with your friends and have the computer guess.</p>

          <div>
              <button id="createGameButton" onClick={this.createGame}>Create game</button>
              gameId:
              <input id="gameIdBox" value={this.state.game_id} onChange={(e) => {this.setState({game_id: e.target.value})}} />
              <button id="getGameButton" onClick={this.getGame}>Get game</button>
          </div>
      </>
    )
  }
}

ReactDOM.render(<Game />, document.getElementById('root'))
