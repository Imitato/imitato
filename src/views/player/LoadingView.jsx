import React from 'react'
import styled from 'styled-components'

export default class LoadingView extends React.Component {
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
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #3f51b5;
  z-index: 1000;

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
  @mixin fade-transition($element) {
    -webkit-transition: $element 0.15s ease-in-out;
    -moz-transition: $element 0.15s ease-in-out;
    -ms-transition: $element 0.15s ease-in-out;
    -o-transition: $element 0.15s ease-in-out;
    transition: $element 0.15s ease-in-out;
  }
  .red {
    color: #FBBD06;
    border: 3px solid #EA4436;
    background: #EA5034;
    &:hover {
      background: #EA4436;
    }
  }
  .yellow {
    color: #EA4436;
    border: 3px solid #FBBD06;
    background: #FBCE05;
    &:hover {
      background: #FBBD06;
    }
  }
  .shiny_button {
    font-family: 'Montserrat', sans-serif;
    font-weight: 300;
    text-decoration: none;
    padding: 14px;
    border-radius: 48px;
    
    position: relative;
    text-align: center;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
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
    
      background: -moz-linear-gradient(left,  rgba(255,255,255,0) 0%, rgba(255,255,255,0.03) 1%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.85) 70%, rgba(255,255,255,0.85) 71%, rgba(255,255,255,0) 100%); /* FF3.6+ */
      background: -webkit-gradient(linear, left top, right top, color-stop(0%,rgba(255,255,255,0)), color-stop(1%,rgba(255,255,255,0.03)), color-stop(30%,rgba(255,255,255,0.85)), color-stop(50%,rgba(255,255,255,0.85)), color-stop(70%,rgba(255,255,255,0.85)), color-stop(71%,rgba(255,255,255,0.85)), color-stop(100%,rgba(255,255,255,0))); /* Chrome,Safari4+ */
      background: -webkit-linear-gradient(left,  rgba(255,255,255,0) 0%,rgba(255,255,255,0.03) 1%,rgba(255,255,255,0.6) 30%,rgba(255,255,255,0.85) 50%,rgba(255,255,255,0.85) 70%,rgba(255,255,255,0.85) 71%,rgba(255,255,255,0) 100%); /* Chrome10+,Safari5.1+ */
      background: -o-linear-gradient(left,  rgba(255,255,255,0) 0%,rgba(255,255,255,0.03) 1%,rgba(255,255,255,0.6) 30%,rgba(255,255,255,0.85) 50%,rgba(255,255,255,0.85) 70%,rgba(255,255,255,0.85) 71%,rgba(255,255,255,0) 100%); /* Opera 11.10+ */
      background: -ms-linear-gradient(left,  rgba(255,255,255,0) 0%,rgba(255,255,255,0.03) 1%,rgba(255,255,255,0.6) 30%,rgba(255,255,255,0.85) 50%,rgba(255,255,255,0.85) 70%,rgba(255,255,255,0.85) 71%,rgba(255,255,255,0) 100%); /* IE10+ */
      background: linear-gradient(to right,  rgba(255,255,255,0) 0%,rgba(255,255,255,0.03) 1%,rgba(255,255,255,0.6) 30%,rgba(255,255,255,0.85) 50%,rgba(255,255,255,0.85) 70%,rgba(255,255,255,0.85) 71%,rgba(255,255,255,0) 100%); /* W3C */
      filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00ffffff', endColorstr='#00ffffff',GradientType=1 ); /* IE6-9 */
      
      width: 15%;
      height: 100%;
       transform: skew(-10deg,0deg);
      -webkit-transform: skew(-10deg,0deg);
       -moz-transform: skew(-10deg,0deg);
       -ms-transform: skew(-10deg,0deg);
       -o-transform: skew(-10deg,0deg);
    
       animation: move 2s;
      animation-iteration-count: infinite;
      animation-delay: 1s;
      -webkit-animation: move 2s;
      -webkit-animation-iteration-count: infinite;
      -webkit-animation-delay: 1s;
      -moz-transform: skew(-10deg,0deg);
      -moz-animation: move 2s;
      -moz-animation-iteration-count: infinite;
      -moz-animation-delay: 1s;
      -ms-transform: skew(-10deg,0deg);
      -ms-animation: move 2s;
      -ms-animation-iteration-count: infinite;
      -ms-animation-delay: 1s;
      -o-transform: skew(-10deg,0deg);
      -o-animation: move 2s;
      -o-animation-iteration-count: infinite;
      -o-animation-delay: 1s;
    }
  @keyframes move {
    0%  { left: 0; opacity: 0; }
    5% {opacity: 0.0}
    48% {opacity: 0.2}
    80% {opacity: 0.0}
    100% { left: 82%}
  }
  @-webkit-keyframes move {
    0%  { left: 0; opacity: 0; }
    5% {opacity: 0.0}
    48% {opacity: 0.2}
    80% {opacity: 0.0}
    100% { left: 82%}
  }
  @-moz-keyframes move {
    0%  { left: 0; opacity: 0; }
    5% {opacity: 0.0}
    48% {opacity: 0.2}
    80% {opacity: 0.0}
    100% { left: 88%}
  }
  @-ms-keyframes move {
    0%  { left: 0; opacity: 0; }
    5% {opacity: 0.0}
    48% {opacity: 0.2}
    80% {opacity: 0.0}
    100% { left: 82%}
  }
  @-o-keyframes move {
    0%  { left: 0; opacity: 0; }
    5% {opacity: 0.0}
    48% {opacity: 0.2}
    80% {opacity: 0.0}
    100% { left: 82%}
  }
`
