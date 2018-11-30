import React from 'react'
import styled from 'styled-components'

const REDIRECT_TARGET = '/player'
const REDIRECT_DELAY = 6400

export default class LoadingPage extends React.Component {
  componentDidMount() {
    window.setTimeout(() => {
      location.href = REDIRECT_TARGET
    }, REDIRECT_DELAY)
  }

  render() {
    return (
      <Styles>
        <div className="loading-image">
          <div className="potato potato-left bounce" />
          <div className="tomato bounce">
            <div className="tomato-stem" />
            <div className="tomato-body" />
          </div>
          <div className="potato potato-right bounce" />
        </div>
        <div className="loading-text">Loading...</div>
      </Styles>
    )
  }
}

const Styles = styled.div`
  .loading-text {
    display: flex;
    justify-content: center;
  }

  .loading-image {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .tomato {
    position: relative;
    top: 7px;
    margin: 0 20px;
  }

  .tomato-body {
    position: relative;
    width: 24px;
    height: 20px;
    border-radius: 11px;
    background-color: #ea4436;
  }

  .tomato-stem {
    position: relative;
    z-index: 1;
    top: 3px;
    left: 8px;
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
    transform: rotate(15deg);
  }

  .potato-right {
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
