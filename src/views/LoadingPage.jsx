import React from 'react'
import styled from 'styled-components'

const REDIRECT_TARGET = 'game.html'

export default class LoadingPage extends React.Component {
  componentDidMount() {
    // window.setTimeout(this._redirect, 6400)
  }

  render() {
    return (
      <Styles>
        <div className="loading-image">
          <div className="potato potato-left bounce" />
          <div className="tomato bounce">
            <div className="tomato-body" />
            <div className="tomato-stem" />
          </div>
          <div className="potato potato-right bounce" />
        </div>
        <div className="loading-text">Loading...</div>
      </Styles>
    )
  }

  _redirect = () => {
    location.href = REDIRECT_TARGET
  }
}

const Styles = styled.div`
  .loading-text {
    display: flex;
    justify-content: center;
    margin-right: 39px;
  }

  .loading-image {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .tomato {
    position: relative;
  }

  .tomato-body {
    position: absolute;
    margin: 0 10px;
    width: 24px;
    height: 20px;
    border-radius: 11px;
    background-color: #ea4436;
  }

  .tomato-stem {
    position: absolute;
    margin: 0 18px;
    width: 8px;
    height: 4px;
    border-radius: 11px;
    background-color: #34a952;
  }

  .potato {
    position: relative;
    width: 20px;
    height: 26px;
    border-radius: 11px;
    background-color: #fbbd06;
  }

  .potato-left {
    margin: 0 10px;
    transform: rotate(15deg);
  }

  .potato-right {
    margin: 0 52px;
    transform: rotate(-15deg);
  }

  .bounce {
    animation: 800ms bounce ease infinite;
  }

  @keyframes bounce {
    50% {
      transform: translateY(25px);
    }
  }
`
