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
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #3f51b5;

  .loading-text {
    color: white;
    font-weight: 600;
    font-size: 18px;
  }

  .loading-image {
    display: flex;
    flex-grow: 1;
    max-height: 130px;
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
      transform: translateY(24px);
    }
  }
`
