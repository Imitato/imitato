import React from 'react'
import styled from 'styled-components'

export default class SetupScreen extends React.Component {
  state = { gameId: '', playerId: '' }

  render() {
    return (
      <Styles>
        <img src="images/imitato.png" />
        <div className="container">
          <label htmlFor="game-id">Game Code</label>
          <input
            name="gameId"
            id="game-id"
            type="text"
            placeholder="Enter 6 digit code"
            value={this.state.gameId}
            onChange={this._onChange}
          />
          <label htmlFor="player-id">Name</label>
          <input
            name="playerId"
            id="player-id"
            type="text"
            placeholder="Enter your name"
            value={this.state.playerId}
            onChange={this._onChange}
          />
          <button onClick={this._onSubmit}>Join</button>
        </div>
      </Styles>
    )
  }

  _onChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  _onSubmit = () => {
    this.props.onJoin(Object.assign({}, this.state))
  }
}

const Styles = styled.div`
  margin: 0 auto;
  padding: 2em;
  max-width: 500px;

  img {
    width: 100%;
    margin-bottom: 20px;
  }

  .container {
    display: flex;
    flex-direction: column;
  }

  label {
    margin-bottom: 0.5em;
  }

  input {
    margin-bottom: 1em;
    padding: 0.5em;
    box-shadow: 0 0px 4px rgba(0, 0, 0, 0.3);
    border: 1px solid gray;
    border-radius: 0.2em;

    text-transform: uppercase;
  }

  button {
    border-radius: 0.4em;
    padding: 0.5em;
    background-color: #3f51b5;
    color: white;
    text-transform: uppercase;
    font-size: 20px;
    font-weight: 600;
    cursor: pointer;
  }
`
