import React from 'react'
import styled from 'styled-components'
import axios from 'axios'
import io from 'socket.io-client'
import LoadingView from './LoadingView'

const USER_MEDIA_CONSTRAINTS = {
  video: {
    facingMode: 'user',
  },
}

export default class PhotoScreen extends React.Component {
  state = {
    streaming: false,
    captureEnabled: false,
    photoTaken: false,
    message: 'Waiting for players to join...',
  }

  constructor(props) {
    super(props)

    const { gameId, playerId } = this.props
    const query = { role: 'player', gameId, playerId }
    this.socket = io({ query })
    this.socket.on('round start', () => {
      this.setState({ message: 'Take a picture!', captureEnabled: true })
    })

    this.video = React.createRef()
    this.canvas = React.createRef()
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia(USER_MEDIA_CONSTRAINTS)
      .then(stream => {
        this.video.current.srcObject = stream

        // wait a bit for video to load
        setTimeout(() => this.setState({ streaming: true }), 100)
      })
      .catch(console.error)
  }

  render() {
    return (
      <Styles>
        {!this.state.streaming && <LoadingView />}
        {this.state.message && <div id="message">{this.state.message}</div>}
        <div
          className={`photo-container ${
            this.state.photoTaken ? 'hidden' : undefined
          }`}
        >
          <video ref={this.video} className="photo" autoPlay playsInline>
            Video stream not available.
          </video>
          {this.state.captureEnabled && (
            <button id="photo-button" onClick={this.takePhoto} />
          )}
        </div>
        <div
          className={`photo-container ${
            this.state.photoTaken ? undefined : 'hidden'
          }`}
        >
          <canvas ref={this.canvas} className="photo" />
          <button id="retake-button" onClick={this.retakePhoto} />
          <button id="submit-button" onClick={this.submitPhoto} />
        </div>
      </Styles>
    )
  }

  takePhoto = () => {
    const video = this.video.current
    const canvas = this.canvas.current

    const width = video.videoWidth
    const height = video.videoHeight

    const context = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    context.drawImage(video, 0, 0, width, height)

    this.setState({ photoTaken: true })
  }

  retakePhoto = () => {
    this.setState({ photoTaken: false })
  }

  submitPhoto = () => {
    const { gameId, playerId } = this.props
    const canvas = this.canvas.current
    canvas.toBlob(blob => {
      const data = new FormData()
      data.append('image', blob)
      axios
        .post('/imitato/game/round/submit', data, {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          },
          params: { gameId, playerId },
        })
        .then(response => {
          this.setState({ photoTaken: false })
        })
        .catch(error => console.log(error))
    }, 'image/jpeg')
  }
}

const Styles = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  #message {
    padding: 0.5em;
    background-color: #3f51b5;
    color: white;
    font-weight: 600;
    text-align: center;
  }

  .photo-container {
    position: relative;
    flex-grow: 1;
  }

  .photo {
    position: absolute;
    width: calc(100vw + 1px);
    height: 100%;
    border: none;
    transform: scale(-1, 1);
    object-fit: cover;
  }

  .hidden {
    display: none;
  }

  #photo-button {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 40px;
    margin: 0 auto;
    padding: 0;
    width: 60px;
    height: 60px;
    border: none;

    background: url('https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg')
      no-repeat center;
    background-size: contain;
    filter: drop-shadow(0 0 1px black);
    cursor: pointer;
  }

  #retake-button {
    position: absolute;
    top: 20px;
    left: 20px;
    padding: 0;
    width: 24px;
    height: 24px;
    border: none;

    background: url(images/close-button.svg) no-repeat center;
    background-size: contain;
    filter: drop-shadow(0 0 0.8px black);
    cursor: pointer;
  }

  #submit-button {
    position: absolute;
    right: 20px;
    bottom: 20px;
    padding: 0;
    width: 48px;
    height: 48px;
    border: none;

    background: url(images/play-button.svg) no-repeat center;
    background-size: contain;
    filter: drop-shadow(0 0 1px black);
    cursor: pointer;
  }
`
